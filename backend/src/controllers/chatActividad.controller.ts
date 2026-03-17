import type {Request, Response} from 'express';
import * as ChatActividadModel from '../models/chatActividad.model.js';
import * as ActividadService from "../services/actividad.service.js";

export const getChatPorActividad = async (req: Request, res: Response) => {
    const  idActividad = Number(req.params.idActividad);
    const idUsuario = Number(req.userId);

    // Validar que idActividad y idUsuario es un número válido
    if (isNaN(idActividad) || isNaN(idUsuario)) {
        return res.status(400).json({ message: 'ID de actividad o usuario inválido' });
    }


    //el usuario está en la actividad
    const estaEnActividad = await ActividadService.ActividadService.esUsuarioParticipante(idActividad, idUsuario);

    if (!estaEnActividad) {
        return res.status(403).json({ message: 'No tienes permiso para acceder al chat de esta actividad' });
    }

    try {
        const idChat = await ChatActividadModel.getIdChatActividadPorIdActividad(idActividad);
        const chat = await ChatActividadModel.getChatActividadPorId(idChat!);
        res.json(chat);
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