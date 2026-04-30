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
        const response = await api.get(`chatIndividual/${idUsuario}`);
        return response.data;
    } catch (error: any) {

        if (error.response && error.response.status === 404) {
            return false; // No se encontró el chat individual
        }
        throw error; // Relanzar otros errores
    }
}

//obtener todos mis chats individuales
export const getMisChatsIndividual = async (): Promise<ChatIndividual[]> => {
    const response = await api.get(`chatIndividual/chats/mios`);
    return response.data;
}




////ACTIVIDAD

//obtener chat de una actividad por id de actividad
export const getChatActividad = async (idActividad: number): Promise<ChatActividad | boolean> => {

    try {
        const response = await api.get(`chatActividad/actividad/${idActividad}`);
        return response.data;
    } catch (error: any) {

        if (error.response && error.response.status === 404) {
            return false; // No se encontró el chat individual
        }
        throw error; // Relanzar otros errores
    }
}

//obtener todos mis chats de actividad
export const getMisChatsActividad = async (): Promise<ChatActividad[]> => {
    const response = await api.get(`chatActividad/chats/mios`);
    return response.data;
}