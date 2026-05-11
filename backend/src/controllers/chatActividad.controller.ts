import type {Request, Response} from 'express';
import * as ChatActividadModel from '../models/chatActividad.model.js';
import * as ActividadService from "../services/actividad.service.js";
import {getIdActividadPorIdChatActividad, getIdChatActividadPorIdActividad} from "../models/chatActividad.model.js";

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

//obtener chatActividad por su id de chatActividad
export const getChatActividadPorId = async (req: Request, res: Response) => {
    const idChatActividad = Number(req.params.idChatActividad);
    const idUsuario = Number(req.userId);

    // Validar que idChatActividad y idUsuario es un número válido
    if (isNaN(idChatActividad) || isNaN(idUsuario)) {
        return res.status(400).json({message: 'ID de chat de actividad o usuario inválido'});
    }

    try {
        //pertenezco a la actividad de ese chat
        const idActividad = await getIdActividadPorIdChatActividad(idChatActividad);
        const estaEnActividad = await ActividadService.ActividadService.esUsuarioParticipante(idActividad!, idUsuario);
        if (!estaEnActividad) {
            return res.status(403).json({message: 'No tienes permiso para acceder al chat de esta actividad'});
        }

        const chat = await ChatActividadModel.getChatActividadPorId(idChatActividad);
        res.json(chat);

    } catch (error) {
        console.error('Error al obtener chat de actividad por id:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}


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
//obtener todos los chats de actividad en los que participo
//1. Llamar al servicio para obtener todas las id de actividades en las que el usuario participa
//2. Por cada id de actividad, obtener el chat de actividad correspondiente
export const getMisChatsActividad = async (req: Request, res: Response) => {
    const idUsuario = Number(req.userId);

    // Validar que idUsuario es un número válido
    if (isNaN(idUsuario)) {
        return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    try {
        const idActividades = await ActividadService.ActividadService.getIdActividadesPorUsuario(idUsuario);
        const chatsActividad = await Promise.all(idActividades.map(idActividad => ChatActividadModel.getIdChatActividadPorIdActividad(idActividad)));//obtiene los id de los chats
        //crea el array con los objetos de chat actividad a partir de los id de los chats
        const chatsActividadObjetos = await Promise.all(chatsActividad.map(idChat => ChatActividadModel.getChatActividadPorId(idChat!)));

        res.json(chatsActividadObjetos);
    } catch (error) {
        console.error('Error al obtener mis chats de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}



export const createChatActividad = async (req: Request, res: Response) => {
    try {
        const chatActividad = await ChatActividadModel.crearChatActividad(req.body);
        res.status(201).json(chatActividad);
    } catch (error) {
        console.error('Error al crear chat de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};