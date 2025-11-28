import type {Request, Response} from 'express';
import * as LikeModel from '../models/likeMegusta.model.js';

//obtiene todos los likes de la base de datos
export const getLikesMegusta = async (req: Request, res: Response) => {
    try {
        const likesMegusta = await LikeModel.getAllLikeMegusta();
        res.json(likesMegusta);
    } catch (error) {
        console.error('Error al obtener likes/megustas:', error);
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
        console.error('Error al obtener likes/megustas por idRecuerdo:', error);
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
        console.error('Error al obtener likes/megustas por idComentario:', error);
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
        console.error('Error al obtener numero de likes/megustas por idComentario:', error);
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
        console.error('Error al obtener numero de likes/megustas por idRecuerdo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createLikeMegusta = async (req: Request, res: Response) => {
    try {
        const likeMegusta = await LikeModel.crearLikeMegusta(req.body);
        res.status(201).json(likeMegusta);
    } catch (error) {
        console.error('Error al crear like/megusta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const deleteLikeMegusta = async (req: Request, res: Response) => {
    try {
        const { idLike } = req.params;
        const eliminado = await LikeModel.eliminarLikeMegusta(Number(idLike));

        if (eliminado) {
            res.json({ message: 'Like/Megusta eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Like/Megusta no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar like/megusta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};