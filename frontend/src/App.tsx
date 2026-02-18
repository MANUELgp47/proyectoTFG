//import {useEffect} from 'react'
import './App.css'
//import api from './api/axios';
//import Login from './auth/Login';
import Register from './auth/Register';


function App() {
    const token = localStorage.getItem('token');
    console.log('Token almacenado:', token);

    /*useEffect(() => {//TEST axios
        console.log('App montada, ejecutando petición...');

        api.put('/notificacion/48')
            .then(res => {
                console.log('Respuesta backend:', res.data);
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }, []);
*/

    return (
        <div>
            <Register />
        </div>
    );
}

export default App
