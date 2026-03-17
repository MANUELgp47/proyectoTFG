import type {Request, Response} from 'express';
import * as ComentarioModel from '../models/comentario.model.js';
import {RecuerdoService} from "../services/recuerdo.service.js";

export const getComentarios = async (req: Request, res: Response) => {
    try {
        const comentarios = await ComentarioModel.getAllComentarios();
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
//comentarios de un recuerdo
export const getComentariosPorRecuerdo = async (req: Request, res: Response) => {
    const idRecuerdo = req.params.idRecuerdo;
    try {

        const comentarios = await ComentarioModel.getComentariosPorRecuerdo(Number(idRecuerdo));
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios por recuerdo:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}
//comentarion por id
export const getComentarioPorId = async (req: Request, res: Response) => {
    const idComentario: number = Number(req.params.idComentario);
    try {
        const comentario = await ComentarioModel.getComentarioPorId(idComentario);
        if (comentario) {
            res.json(comentario);
        } else {
            res.status(404).json({message: 'Comentario no encontrado'});
        }
    } catch (error) {
        console.error('Error al obtener comentario por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}
//todos los comentarios de un usuario
export const getComentariosPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = Number(req.params.idUsuario);
    try {
        const comentarios = await ComentarioModel.getComentariosPorUsuario(idUsuario);
        res.json(comentarios);
    } catch (error) {
        console.error('Error al obtener comentarios por usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}
export const createComentario = async (req: Request, res: Response) => {
    try {


        req.body.idUsuario = req.userId;

        //validar que el contenido no esté vacío
        if (!req.body.mensaje || req.body.mensaje.trim() === '') {

            return res.status(400).json({message: 'El contenido del comentario no puede estar vacío'});
        }
        //validar que existe el recuerdo
        if (!req.body.idRecuerdo) {

            return res.status(400).json({message: 'El ID del recuerdo es obligatorio'});
        }
        const existeRecuerdo = await RecuerdoService.existeRecuerdo(req.body.idRecuerdo);
        if (!existeRecuerdo) {

            return res.status(404).json({message: 'El recuerdo al que se quiere comentar no existe'});
        }



        const comentario = await ComentarioModel.crearComentario(req.body);

        res.status(201).json(comentario);
    } catch (error) {
        console.error('Error al crear comentario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const deleteComentario = async (req: Request, res: Response) => {
    const idComentario = Number(req.params.idComentario);
    const idUsuario = req.userId;

    //verificar que el comentario existe
    //el creador del comentario es el mismo que lo quiere eliminar
    const comentario = await ComentarioModel.getComentarioPorId(idComentario);
    if (!comentario) {
        return res.status(404).json({message: 'Comentario no encontrado'});
    }
    if (comentario.idUsuario !== idUsuario) {
        return res.status(403).json({message: 'No tienes permiso para eliminar este comentario'});
    }

    try {
        const eliminado = await ComentarioModel.eliminarComentario(idComentario);
        if (eliminado) {
            res.json({message: 'Comentario eliminado correctamente'});
        } else {
            res.status(404).json({message: 'Comentario no encontrado'});
        }
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
