//configurações que a conexão com o banco não tem
//o knex não suport a sintaxe 'export default', então tem que ser module.exports
//comando --> npx knex migrate:latest --knexfile knexfile.ts 
//dica --> command shift p, sqlite 
//em package.json, foi criado um comando para evitar a linha toda da migration --> npm run knex:migrate

import path from 'path';


module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    }, 
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
};