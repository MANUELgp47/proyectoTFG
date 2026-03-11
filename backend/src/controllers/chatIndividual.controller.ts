import type {Request, Response} from 'express';
import * as ChatIndividualModel from '../models/chatIndividual.model.js';
import {AmistadService} from "../services/amistad.service.js";
import * as UsuarioService from "../services/usuario.service.js";

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
    const idChatIndividual = Number(req.params.id);

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
    const idUsuario1 = Number(req.params.idUsuario1);
    const idUsuario2 = Number(req.params.idUsuario2);
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


//obtener chat individual por id de usuario emisor o receptor
export const getChatIndividualPorUsuario = async (req: Request, res: Response) => {

    console.log("req.params.idUsuario", req.params.idUsuario, "req.userId", req.userId);

    const idParametro = Number(req.params.idUsuario);
    const idUsuario = req.userId;

    //comprueba atributos idUsuario y idParametro
    if (!idUsuario || isNaN(idParametro)) {

        return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    //exsiste el usuario idParametro
    const usuario = await UsuarioService.UsuarioService.existeUsuarioPorId(idParametro);
    if (!usuario) {

        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    try {

        const chatIndividual = await ChatIndividualModel.getChatIndividualPorUsuarios(idUsuario, idParametro);

        if (!chatIndividual) {
            return false;
        }
        console.log(chatIndividual);
        res.json(chatIndividual);
    } catch (error) {
        console.error('Error al obtener chat individual por usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};



export const createChatIndividual = async (req: Request, res: Response) => {
    try {
        const idReceptor = Number(req.params.idReceptor);
        const idEmisor = req.userId;


        console.log("idEmisor", idEmisor, "idReceptor", idReceptor);

        //valida idEmisor y idReceptor
        if (!idEmisor || isNaN(idReceptor)) {
            return res.status(400).json({ message: 'IDs de usuario inválidos' });
        }

        //verifica si ya existe un chat entre los dos usuarios
        const chatExistente = await ChatIndividualModel.getChatIndividualPorUsuarios(idEmisor, idReceptor);
        if (chatExistente) {
            return res.status(409).json({ message: 'El chat individual ya existe' });
        }
        //verifica que sean amigos los dos usuarios antes de crear el chat
        const amigos = await AmistadService.existeAmistad(idEmisor, idReceptor);
        if (!amigos) {
            return res.status(403).json({ message: 'Los usuarios no son amigos' });
        }


        //crea el chat individual
        const chatIndividual = await ChatIndividualModel.crearChatIndividualPorUsuarios(idEmisor, idReceptor);
        console.log("chatIndividual creado", chatIndividual);
        res.status(201).json(chatIndividual);
    } catch (error) {
        console.error('Error al crear chat individual:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};


// Eliminar un chat individual por ID
export const deleteChatIndividual = async (req: Request, res: Response) => {
    const idChatIndividual = Number(req.params.id);

    try {
        const eliminado = await ChatIndividualModel.eliminarChatIndividual(idChatIndividual);
        if (!eliminado) {
            return res.status(404).json({ message: 'Chat individual no encontrado' });
        }
        res.json({ message: 'Chat individual eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar chat individual:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}