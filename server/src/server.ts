import express from 'express'; //npm init -y (-y para definir tudo default) e depois npm install express, npm install @types/express
import routes from './routes';
import path from 'path';
import cors from 'cors'; //instalação --> npm install cors e npm install @types/cors -D

const app = express();

app.use(express.json());
app.use(cors()); //assim, vai permitir que todas as urls acessem a API, depois pode colocar o endereço da aplicação. Precisa estar antes das rotas
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads' )))

app.listen(3333) 
