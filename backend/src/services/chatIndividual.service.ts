import type {CrearChatActividad} from '../types/chatActividad.js';
import * as ChatIndividualModel from '../models/chatIndividual.model.js';

export class ChatIndividualService {

    static async getUsuariosPorIdChatIndividual(idChatIndividual: number): Promise<{idUsuario1: number, idUsuario2: number} | null> {
        const usuarios = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
        return usuarios;
    }
}