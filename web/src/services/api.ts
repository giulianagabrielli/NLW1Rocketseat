import axios from 'axios'; //npm install axios --> integra o react com o backend/api em node

const api = axios.create({
    baseURL: 'http://localhost:3333'
});

export default api;