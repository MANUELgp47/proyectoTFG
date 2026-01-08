import type {Request, Response} from 'express';
import * as ChatActividadModel from '../models/chatActividad.model.js';

export const getChatPorActividad = async (req: Request, res: Response) => {
    const  idActividad: number = req.body.idActividad;
    try {
        const chats = await ChatActividadModel.getChatActividadPorId(idActividad);
        res.json(chats);
    } catch (error) {
        console.error('Error al obtener chats de la actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//obtiene todos los chats de actividad
export const getChatsActividad = async (req: Request, res: Response) => {
    try {
        const chatsActividad = await ChatActividadModel.getChatsActividad();
        res.json(chatsActividad);
    } catch (error) {
        console.error('Error al obtener chats de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createChatActividad = async (req: Request, res: Response) => {
    try {
        const chatActividad = await ChatActividadModel.crearChatActividad(req.body);
        res.status(201).json(chatActividad);
    } catch (error) {
        console.error('Error al crear chat de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};