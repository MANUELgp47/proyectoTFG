import type {Request, Response} from 'express';
import * as ChatIndividualModel from '../models/chatIndividual.model.js.model.js';

export const getChatsIndividual = async (req: Request, res: Response) => {
    try {
        const chatIndividuals = await ChatIndividualModel.getAllChatIndividuals();
        res.json(chatIndividuals);
    } catch (error) {
        console.error('Error al obtener chats individuales:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getChatIndividualPorId = async (req: Request, res: Response) => {
    const idChatIndividual = parseInt(req.params.id, 10);

    try {
        const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
        if (!chatIndividual) {
            return res.status(404).json({ message: 'Chat individual no encontrado' });
        }
        res.json(chatIndividual);
    } catch (error) {
        console.error('Error al obtener chat individual por ID:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//get chat individual por id de usuario1 y id de usuario2
export const getChatIndividualPorUsuarios = async (req: Request, res: Response) => {
    const idUsuario1 = parseInt(req.params.idUsuario1, 10);
    const idUsuario2 = parseInt(req.params.idUsuario2, 10);
    try {
        const chatIndividual = await ChatIndividualModel.getChatIndividualPorUsuarios(idUsuario1, idUsuario2);
        if (!chatIndividual) {
            return res.status(404).json({ message: 'Chat individual no encontrado' });
        }
        res.json(chatIndividual);
    } catch (error) {
        console.error('Error al obtener chat individual por usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createChatIndividual = async (req: Request, res: Response) => {
    try {
        const chatIndividual = await ChatIndividualModel.crearChatIndividual(req.body);
        res.status(201).json(chatIndividual);
    } catch (error) {
        console.error('Error al crear chat individual:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};