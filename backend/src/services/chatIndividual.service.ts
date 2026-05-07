import type {CrearChatActividad} from '../types/chatActividad.js';
import * as ChatIndividualModel from '../models/chatIndividual.model.js';

export class ChatIndividualService {

    static async getUsuariosPorIdChatIndividual(idChatIndividual: number): Promise<{idUsuario1: number, idUsuario2: number} | null> {
        const usuarios = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
        return usuarios;
    }

    //existe chat entre dos usuarios?
    static async existeChatEntreUsuarios(idUsuario1: number, idUsuario2: number): Promise<boolean> {
        return await ChatIndividualModel.existeChatEntreUsuarios(idUsuario1, idUsuario2);
    }
}