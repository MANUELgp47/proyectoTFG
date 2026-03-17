import api from "../api/axios";
import type {ChatActividad, ChatIndividual} from '../types';

//crea chat individual

export const crearChatIndividual = async (idReceptor: number): Promise<ChatIndividual> => {
    const response = await api.post(`chatIndividual/${idReceptor}`);
    return response.data;
}
//obtener chat individual por id de usuario emisor o receptor si no lo encuentra devuelve false
export const getChatIndividualPorUsuario = async (idUsuario: number): Promise<ChatIndividual | false> => {
    try {
        const response = await api.get(`chatIndividual/usuario/${idUsuario}`);
        return response.data;
    } catch (error) {

        if (error.response && error.response.status === 404) {
            return false; // No se encontró el chat individual
        }
        throw error; // Relanzar otros errores
    }
}




////ACTIVIDAD

//obtener chat de una actividad por id de actividad
export const getChatActividad = async (idActividad: number): Promise<ChatActividad> => {

    try {
        const response = await api.get(`chatActividad/actividad/${idActividad}`);
        return response.data;
    } catch (error) {

        if (error.response && error.response.status === 404) {
            return false; // No se encontró el chat individual
        }
        throw error; // Relanzar otros errores
    }
}