//para instalar e executar o react --> npx create-react-app web --template=typescript
//para executar em localhost:3000 --> npm start
//JSX --> possibilidade de escrever html dentro do JS
//Estado --> informações mantidas pelos componentes
//useState() retorna sempre um array --> [valor do estado, função para atualizar o valor do estado]
//npm install react-router-dom --> lib de rotas (npm install @types/react-router-dom -D)

import React from 'react';
import './App.css';

import Routes from './routes';


function App() {
  return (
    <Routes />

  );
}

export default App;
