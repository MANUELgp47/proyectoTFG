import type {Request, Response} from 'express';
import * as LikeModel from '../models/likeMegusta.model.js';

//todos los likes de un recuerdo o comentario
export const getNumeroLikesTotales = async (req: Request, res: Response) => {
    try {
        const { idRecuerdo, idComentario } = req.query;

        let numeroLikes: number;

        if (idRecuerdo) {
            numeroLikes = await LikeModel.getNumeroLikesRecuerdo(Number(idRecuerdo));
        } else if (idComentario) {
            numeroLikes = await LikeModel.getNumeroLikesComentario(Number(idComentario));
        } else {
            return res.status(400).json({ message: 'Se requiere idRecuerdo o idComentario' });
        }

        res.json({ numeroLikes });
    } catch (error) {
        console.error('Error al obtener likes:', error);
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