import knex from '../database/connection';
import { Request, Response, request } from 'express';

class PointsController {

    async create(request: Request, response: Response) {
        const {
            name, 
            email, 
            whatsapp, 
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        //transaction --> a segunda query só vai ser feita se a primeira ocorrer com sucesso. 
        //Ao invés de usar knex().insert(), usamos trx().insert()
        const trx = await knex.transaction();
    
        const point = {
            image: request.file.filename,
            name, 
            email, 
            whatsapp, 
            latitude,
            longitude,
            city,
            uf
        };
        //esse insert retorna o id, por isso a variável insertedIds
        const insertedIds = await trx('points').insert(point);
    
        //inserindo informações na tabela point_items
        const point_id = insertedIds[0];
        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
        await trx('point_items').insert(pointItems)
    
        await trx.commit()
    
        return response.json({
            id: point_id,
            ...point,
        });
    
    }

    async show(request: Request, response: Response ){
        const {id} = request.params; //ou const id = request.params.id;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.'});
        }

        const serializedPoints = {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`
        }

        //mostrando os items dentro de pontos de coleta
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id' )
            .where('point_items.point_id', id)
            .select('items.title')

        return response.json({ point: serializedPoints, items });
    }

    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim())); //item.trim() para tirar os espaços com vírgulas se existirem

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`
            }
        })
    
        return response.json(serializedPoints)
    }

}


export default PointsController