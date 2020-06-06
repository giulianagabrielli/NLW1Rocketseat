import express from 'express';
import { celebrate, Joi } from 'celebrate'; //npm install celebrate --> validações. npm install @types/hapi__joi -D
import multer from 'multer';
import multerConfig from './config/multer';


import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);
routes.get('/points/:id', pointsController.show);
routes.get('/points', pointsController.index);

routes.post(
    '/points', 
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        })
    }, {
        abortEarly: false
    }),
    pointsController.create
    );

export default routes;

//precisa instalar o módulo CORS --> npm install cors
//upload.single('image') --> single pq é só uma foto, poderia ser array(), e 'image' é o nome do campo na tabela
//Para incluir imagem no insomnia, é necessário trocar o tipo de JSON para Multipart Form. Em image, trocar text para file.