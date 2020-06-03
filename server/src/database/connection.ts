//instalar o knex --> npm install knex para escrever as queries do banco de dados
//instalar o sqlite --> npm install sqlite3

import knex from 'knex';
import path from 'path';

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true,
})

export default connection;


//path.resolve() --> une caminhos. Padroniza o caminho para não dar erro na variação de SO