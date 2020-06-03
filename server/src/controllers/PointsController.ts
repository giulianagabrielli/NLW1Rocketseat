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
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
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
        const pointItems = items.map((item_id: number) => {
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

        //mostrando os items dentro de pontos de coleta
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id' )
            .where('point_items.point_id', id)
            .select('items.title')

        return response.json({ point, items });
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

        return response.json(points)
    }

}


export default PointsController