import knex from '../database/connection';
import {Request, Response} from 'express';


class ItemsController {

    //quando houver queries, precisa usar o await
    async index (request: Request, response: Response) {
        const items = await knex('items').select('*');
    
        //para alterar a visualização das informações para o usuário --> serialização
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3333/uploads/${item.image}`
            }
        })

        return response.json(serializedItems)
    }
}

export default ItemsController