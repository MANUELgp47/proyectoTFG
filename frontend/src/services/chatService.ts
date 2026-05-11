import api from "../api/axios";
import type {ChatActividad, ChatIndividual} from '../types';

//crea chat individual

export const crearChatIndividual = async (idReceptor: number): Promise<ChatIndividual> => {
    const response = await api.post(`chatIndividual/${idReceptor}`);
    return response.data;
}


//existe chat entre dos personas?
export const existeChatConmigo = async (idUsuario1: number): Promise<boolean> => {
    try {
        const response = await api.get(`chatIndividual/existe/${idUsuario1}`);
        return response.data.existe;
    } catch (error) {
        console.error('Error al verificar existencia de chat entre usuarios:', error);
        throw error;
    }
}


//obtener chat individual por id de usuario emisor o receptor si no lo encuentra devuelve false
export const getChatIndividualPorUsuario = async (idUsuario: number): Promise<ChatIndividual | false> => {
    try {
        const response = await api.get(`chatIndividual/${idUsuario}`);

        console.log("Chat individual encontrado:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(error);

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

//obtener chat individual por id de chat individual
export const getChatIndividualPorId = async (idChatIndividual: number): Promise<ChatIndividual | false> => {
    try {
        const response = await api.get(`chatIndividual/id/${idChatIndividual}`);
        return response.data;
    } catch (error: any) {

        if (error.response && error.response.status === 404) {
            return false; // No se encontró el chat individual
        }
        throw error; // Relanzar otros errores
    }
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

//obtener el chatActividad por su id de chatActividad
export const getChatActividadPorIdChat = async (idChatActividad: number): Promise<ChatActividad | boolean> => {

    const response = await api.get(`chatActividad/id/${idChatActividad}`);
    return response.data;

}
//obtener todos mis chats de actividad
export const getMisChatsActividad = async (): Promise<ChatActividad[]> => {
    const response = await api.get(`chatActividad/chats/mios`);
    return response.data;
}