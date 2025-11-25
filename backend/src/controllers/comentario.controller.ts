import type {Request, Response} from 'express';
import * as ComentarioModel from '../models/comentario.model.js';

export const getComentarios = async (req: Request, res: Response) => {
    try {
        const comentarios = await ComentarioModel.getAllComentarios();
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
//comentarios de un recuerdo
export const getComentariosPorRecuerdo = async (req: Request, res: Response) => {
    const idRecuerdo = parseInt(req.params.idRecuerdo, 10);
    try {
        const comentarios = await ComentarioModel.getComentariosPorRecuerdo(idRecuerdo);
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios por recuerdo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}
//comentarion por id
export const getComentarioPorId = async (req: Request, res: Response) => {
    const idComentario = parseInt(req.params.idComentario, 10);
    try {
        const comentario = await ComentarioModel.getComentarioPorId(idComentario);
        if (comentario) {
            res.json(comentario);
        } else {
            res.status(404).json({ message: 'Comentario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener comentario por ID:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}
//todos los comentarios de un usuario
export const getComentariosPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    try {
        const comentarios = await ComentarioModel.getComentariosPorUsuario(idUsuario);
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios por usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}
export const createComentario = async (req: Request, res: Response) => {
    try {
        const comentario = await ComentarioModel.crearComentario(req.body);
        res.status(201).json(comentario);
    } catch (error) {
        console.error('Error al crear comentario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const deleteComentario = async (req: Request, res: Response) => {
    const idComentario = parseInt(req.params.idComentario, 10);
    try {
        const eliminado = await ComentarioModel.eliminarComentario(idComentario);
        if (eliminado) {
            res.json({ message: 'Comentario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Comentario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
