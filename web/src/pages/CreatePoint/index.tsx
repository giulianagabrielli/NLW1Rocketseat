import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'; //useEffect() recebe dois parâmetros, 1-qual função executar, 2-quando. ChangeEvent é a tipagem do evento.
import { Link, useHistory } from 'react-router-dom'; //useHistory permite navegar de um componente para o outro sem um botão
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'; //npm install leaflet react-leaflet --> lib de mapas npm install @types/react-leaflet -D. Precisa incluir um link no index.html
import api from '../../services/api'; //npm install axios --> biblioteca para integrar o react com o backend
import axios from 'axios'; //para usar as apis do IBGE
import { LeafletMouseEvent } from 'leaflet'; //para se localizar no mapa
import Dropzone from '../../components/Dropzone'; //npm install react-dropzone

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUF {
    sigla: string;
}

interface IBGECity {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]); 

    const [ufs, setUfs] = useState<string[]>([]); 
    const [selectedUf, setSelectedUf] = useState('0');

    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '', 
        whatsapp: ''
    })

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectedFile, setSelectedFile] = useState<File>();


    const history = useHistory();

    //sempre que cria um estado para array ou objeto, precisa manualmente informar o tipo da variável que vai ser armazenada ali
    useEffect(()=>{
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    //para pegar a api do IBGE
    useEffect(()=>{
        axios
            .get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);
                setUfs(ufInitials);
             })
    }, []);

    //para pegar as cidades do IBGE sempre que a UF mudar
    useEffect(()=>{
        if(selectedUf ==='0') {
            return;
        }

        axios
            .get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);
            })

    }, [selectedUf]);

    //para pegar a posição do usuário quando carrega a página
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            
        setInicialPosition([ latitude, longitude ]);
        })
    }, []);

    //função de selecionar a UF
    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    //função de selecionar a Cidade
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    //função para selecionar localização no mapa
    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    //função para guardar dados cadastrados
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;

        setFormData({...formData, [name]: value})
    }

    //função para selecionar os itens
    //quando chama a função com parâmetro no html, ela precisa de uma arrow function
    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){

            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems);

        } else {

            setSelectedItems([...selectedItems, id])
        }
    }

    //função para enviar os dados para a Api
    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;


        const data = new FormData();
        
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        if(selectedFile) {
            data.append('image', selectedFile)
        }

        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');
    }

    return (
       <div id="page-create-point">
           <header>
               <img src={logo} alt="Ecoleta"/>

               <Link to="/">
                   <FiArrowLeft />
                   Voltar para home
               </Link>
           </header>

           <form onSubmit={handleSubmit}>
               <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

               <fieldset>
                   <legend>
                       <h2>Dados</h2>
                   </legend>

                   <div className="field">
                       <label htmlFor="name">Nome da entidade</label>
                       <input 
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}
                       />
                   </div>

                   <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="text"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                   </div>
               </fieldset>

               <fieldset>
                   <legend>
                       <h2>Endereço</h2>
                       <span>Selecione o endereço no mapa</span>
                   </legend>

                   <Map center={[-23.5668582, -46.660879]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                   </Map>

                   <div className="field-group">
                       <div className="field">
                           <label htmlFor="uf">Estado (UF)</label>
                           <select 
                            name="uf" 
                            id="uf" 
                            value={selectedUf} 
                            onChange={handleSelectedUf}
                           >
                               <option value="0">Selecione uma UF</option>
                               {ufs.map(uf => (
                                   <option key={uf} value={uf}>{uf}</option>
                               ))}
                           </select>
                       </div>
                       <div className="field">
                           <label htmlFor="city">Cidade</label>
                           <select 
                            name="city" 
                            id="city"
                            value={selectedCity}
                            onChange={handleSelectedCity}
                           >
                               <option value="0">Selecione uma Cidade</option>
                               {cities.map(city => (
                                   <option key={city} value={city}>{city}</option>
                               ))}
                           </select>
                       </div>
                   </div>
               </fieldset>

               <fieldset>
                   <legend>
                       <h2>Ítens de coleta</h2>
                       <span>Selecione o endereço no mapa</span>
                   </legend>

                   <ul className="items-grid">
                       {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => 
                                handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>  
                       ))}
                   </ul>
               </fieldset>

               <button type="submit">Cadastrar ponto de coleta</button>
           </form>
       </div>
    )
}

export default CreatePoint;