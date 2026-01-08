import type {CrearChatActividad} from '../types/chatActividad.js';
import * as ChatActividadModel from '../models/chatActividad.model.js';

export class ChatActividadService {
    //obtener id actividad por id de chat de actividad
    static async getIdActividadPorIdChatActividad(idChatActividad: number): Promise<number | null> {
        const idActividad = await ChatActividadModel.getIdActividadPorIdChatActividad(idChatActividad);
        return idActividad;
    }
}