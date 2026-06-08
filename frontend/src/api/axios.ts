/*
* Este archivo configura una instancia de Axios para interactuar con la API del backend.
* Establece la URL base para las solicitudes y añade un interceptor que incluye el token de autenticación
* en el encabezado de cada solicitud si el token está presente en localStorage.
* la instancia de Axios se exporta para ser utilizada en otros archivos de la aplicación, facilitando las llamadas a la API con autenticación.
*
* */

import axios from 'axios';

const api = axios.create({
    //baseURL: 'https://proyectotfg-production-22de.up.railway.app/api',
    //baseURL: 'http://localhost:3000/api',
    baseURL: 'http://www.memora-tfg:3000/api',
});

// Interceptor: añade el token a cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
