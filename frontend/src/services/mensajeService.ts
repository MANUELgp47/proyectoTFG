import api from "../api/axios";
import type {Mensaje} from '../types';

//devuelve lista de mensajes entre dos usuarios, si no hay mensajes devuelve null
export const getMensajesIndividual = async (idChatIndividual: number, ): Promise<Mensaje[] | null> => {
    const response = await api.get(`mensaje/chat/${idChatIndividual}`);
    return response.data;
};
//devuelve lista de mensajes de una actividad, si no hay mensajes devuelve null
export const getMensajesActividad = async (idChatActividad: number): Promise<Mensaje[] | null> => {
    const response = await api.get(`mensaje/chatActividad/${idChatActividad}`);
    return response.data;
};

//obtiene mensaje por id, si no lo encuentra devuelve null
export const getMensajePorId = async (id: number): Promise<Mensaje | null> => {
    try {
        const response = await api.get(`mensaje/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null; // No se encontró el mensaje
        }
        throw error; // Relanzar otros errores
    }
}


//crear mensjae en chat individual
export const crearMensajeChat = async (data: any): Promise<Mensaje> => {
    const response = await api.post('mensaje', data);
    return response.data;
}

//marca un mensaje como leido por su id
export const marcarMensajeComoLeidoIndividual = async (idMensaje: number): Promise<void> => {
    const response = await api.put(`mensaje/${idMensaje}`);
    return response.data;

}

