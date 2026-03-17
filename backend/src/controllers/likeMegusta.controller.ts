import type {Request, Response} from 'express';
import * as LikeModel from '../models/likeMegusta.model.js';
import {RecuerdoService} from "../services/recuerdo.service.js";
import {ComentarioService} from "../services/comentario.service.js";

//obtiene todos los likes de la base de datos
export const getLikesMegusta = async (req: Request, res: Response) => {
    try {
        const likesMegusta = await LikeModel.getAllLikeMegusta();
        res.json(likesMegusta);
    } catch (error) {
        console.error('Error al obtener likes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todos los likes de un recuerdo
export const getLikesMegustaPorIdRecuerdo = async (req: Request, res: Response) => {
    try {
        const idRecuerdo = Number(req.params.idRecuerdo);
        const likesMegusta = await LikeModel.getLikesMegustaPorIdRecuerdo(idRecuerdo);
        res.json(likesMegusta);
    } catch (error) {
        console.error('Error al obtener likes por idRecuerdo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todos los likes de un comentario
export const getLikesMegustaPorIdComentario = async (req: Request, res: Response) => {
    try {
        const idComentario = Number(req.params.idComentario);
        const likesMegusta = await LikeModel.getLikesMegustaPorIdComentario(idComentario);
        res.json(likesMegusta);
    } catch (error) {
        console.error('Error al obtener likes por idComentario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todos los likes de un comentario
export const getNumeroLikesComentario = async (req: Request, res: Response) => {
    try {
        const idComentario = Number(req.params.idComentario);
        const numeroLikes = await LikeModel.getNumeroLikesComentario(idComentario);
        res.json({ numeroLikes });
    } catch (error) {
        console.error('Error al obtener numero de likes por idComentario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todos los likes de un recuerdo
export const getNumeroLikesRecuerdo = async (req: Request, res: Response) => {
    try {
        const idRecuerdo = Number(req.params.idRecuerdo);
        const numeroLikes = await LikeModel.getNumeroLikesRecuerdo(idRecuerdo);
        res.json({ numeroLikes });
    } catch (error) {
        console.error('Error al obtener numero de likes por idRecuerdo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createLikeMegusta = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.userId;
        req.body.idUsuario = idUsuario;

        console.log("Creando like:", req.body);

        // Validar que venga idRecuerdo o idComentario
        if (!req.body.idRecuerdo && !req.body.idComentario) {
            return res.status(400).json({ message: 'Debe proporcionar idRecuerdo o idComentario' });
        }
        //comprueba que el usuario no haya dado like ya a ese recuerdo o comentario
        //si es un like de recuerdo se asegura de que existe el recuerdo
        if (req.body.idRecuerdo) {
            const recuerdoExiste = await RecuerdoService.existeRecuerdo(req.body.idRecuerdo);
            if (!recuerdoExiste) {
                console.log("Recuerdo no encontrado",req.body.idRecuerdo);
                return res.status(404).json({ message: 'Recuerdo no encontrado' });
            }
            const likeExistente = await LikeModel.getLikesMegustaPorIdRecuerdo(req.body.idRecuerdo)
            //busca el idUsuario en los likes existentes
            for (const like of likeExistente) {
                if (like.idUsuario === idUsuario) {
                    console.log("ya has dado like",like.idUsuario);
                    return res.status(400).json({ message: 'Ya has dado like a este recuerdo' });
                }
            }

        }
        //si es un like de comentario se asegura de que existe el comentario
        if (req.body.idComentario) {
            const comentarioExiste = await ComentarioService.existeComentario(req.body.idComentario);
            if (!comentarioExiste) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }
            const likeExistente = await LikeModel.getLikesMegustaPorIdComentario(req.body.idComentario)
            //busca el idUsuario en los likes existentes
            for (const like of likeExistente) {
                if (like.idUsuario === idUsuario) {
                    return res.status(400).json({ message: 'Ya has dado like a este comentario' });
                }
            }
        }

        const likeMegusta = await LikeModel.crearLikeMegusta(req.body);
        res.status(201).json(likeMegusta);
    } catch (error) {
        console.error('Error al crear like:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const deleteLikeMegusta = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.userId;

        //existe el like
        const like = await LikeModel.getLikeMegustaPorId(Number(req.params.idLike));
        if (!like) {
            return res.status(404).json({ message: 'Like no encontrado' });
        }
        //el like pertenece al usuario que lo quiere eliminar
        if (like.idUsuario !== idUsuario) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este like' });
        }


        const { idLike } = req.params;
        const eliminado = await LikeModel.eliminarLikeMegusta(Number(idLike));

        if (eliminado) {
            res.json({ message: 'Like eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Like no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar like:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener si un Usuario dió like a un recuerdo
export const getLikeMegustaPorIdRecuerdoYIdUsuario = async (req: Request, res: Response) => {
    try {
        const idRecuerdo = Number(req.params.idRecuerdo);
        const idUsuario = Number(req.userId);
        const likeMegusta = await LikeModel.getLikeMegustaPorIdRecuerdoYIdUsuario(idRecuerdo, idUsuario);
        res.json(likeMegusta);
    }
    catch (error) {
        console.error('Error al obtener like por idRecuerdo e idUsuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};