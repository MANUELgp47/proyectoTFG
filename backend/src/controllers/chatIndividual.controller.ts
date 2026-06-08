import type {Request, Response} from 'express';
import * as ChatIndividualModel from '../models/chatIndividual.model.js';
import {AmistadService} from "../services/amistad.service.js";
import * as UsuarioService from "../services/usuario.service.js";
import * as chatIndividualService from "../services/chatIndividual.service.js";

export const getChatsIndividual = async (req: Request, res: Response) => {
    try {
        const chatIndividuals = await ChatIndividualModel.getAllChatIndividuals();
        res.json(chatIndividuals);
    } catch (error) {
        console.error('Error al obtener chats individuales:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};


//devuelve true si existe un chat entre dos usuarios, false si no existe
export const existeChatEntreUsuarios = async (req: Request, res: Response) => {
    const idUsuario1 = Number(req.params.idUsuario1);
    const idUsuario2 = req.userId;

    //comprueba que existe el ususario idUsuario1
    const usuario1 = await UsuarioService.UsuarioService.existeUsuarioPorId(idUsuario1);
    if (!usuario1) {
        return res.status(404).json({ message: 'Usuario 1 no encontrado' });
    }

   // console.log("idUsuario1", idUsuario1, "idUsuario2", idUsuario2);
    try {
        const existeChat = await chatIndividualService.ChatIndividualService.existeChatEntreUsuarios(idUsuario1, Number(idUsuario2));
        res.json({ existe: existeChat });
    } catch (error) {
        console.error('Error al verificar existencia de chat entre usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}


export const getChatIndividualPorId = async (req: Request, res: Response) => {
    const idChatIndividual = Number(req.params.idChatIndividual);
    //comprueba que soy uno de los dos usuarios del chat individual
    const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
    if (!chatIndividual) {
        return res.status(404).json({ message: 'Chat individual no encontrado' });
    }
    const idUsuario = req.userId;
    if (chatIndividual.idUsuario1 !== idUsuario && chatIndividual.idUsuario2 !== idUsuario) {
        return res.status(403).json({ message: 'No tienes permiso para ver este chat individual' });
    }

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
    try {
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

// Obtener todos mis chats individuales
export const getMisChatsIndividual = async (req: Request, res: Response) => {
    const idUsuario = req.userId;
    console.log("idUsuario obtener chats individuales", idUsuario);

    try {
        const chatsIndividuales = await ChatIndividualModel.getMisChatsIndividual(Number(idUsuario));
        //comprueba que los usuarios siguen siendo amigos antes de devolver los chats individuales
        const chatsIndividualesFiltrados = [];
        for (const chat of chatsIndividuales) {
            const idOtroUsuario = chat.idUsuario1 === idUsuario ? chat.idUsuario2 : chat.idUsuario1;
            const sonAmigos = await AmistadService.existeAmistad(Number(idUsuario), idOtroUsuario);
            if (sonAmigos) {
                chatsIndividualesFiltrados.push(chat);
            }
        }

        res.json(chatsIndividualesFiltrados);
    } catch (error) {
        console.error('Error al obtener mis chats individuales:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}


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