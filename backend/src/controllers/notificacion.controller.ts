import type {Request, Response} from 'express';
import * as NotificacionModel from '../models/notificacion.model.js';

export const getNotificaciones = async (req: Request, res: Response) => {
    try {
        const notificacions = await NotificacionModel.getAllNotificacions();
        res.json(notificacions);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getNotificacionById = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;

    if (idNotificacion === undefined) {
        return res.status(400).json({ message: 'idNotificacion es requerido' });
    }

    try {
        const notificacion = await NotificacionModel.getNotificacionPorId(parseInt(idNotificacion, 10) );
        if (notificacion) {
            res.json(notificacion);
        } else {
            res.status(404).json({ message: 'Notificación no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener notificación:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getNotificacionesPorUsuario = async (req: Request, res: Response) => {
    const idUsuarioReceptor = req.params.idUsuario;

    if (idUsuarioReceptor === undefined) {
        return res.status(400).json({ message: 'idUsuarioReceptor es requerido' });
    }


    try {
        const notificacions = await NotificacionModel.getNotificacionesPorUsuario(parseInt(idUsuarioReceptor, 10));
        res.json(notificacions);
    } catch (error) {
        console.error('Error al obtener notificaciones por usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createNotificacion = async (req: Request, res: Response) => {
    try {
        const notificacion = await NotificacionModel.crearNotificacion(req.body);
        res.status(201).json(notificacion);
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }


};

// Actualizar una notificación por id
export const updateNotificacion = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;
  // console.log(' Recibido :', req.body);
    if (idNotificacion === undefined) {
        return res.status(400).json({ message: 'idNotificacion es requerido' });
    }
    try {
        const notificacionActualizada = await NotificacionModel.actualizarNotificacion(parseInt(idNotificacion, 10), req.body);
        if (notificacionActualizada) {
            res.json(notificacionActualizada);
        } else {
            res.status(404).json({ message: 'Notificación no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const deleteNotificacion = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;

    if (idNotificacion === undefined) {
        return res.status(400).json({ message: 'idNotificacion es requerido' });
    }
    try {
        const exito = await NotificacionModel.eliminarNotificacion(parseInt(idNotificacion, 10));
        if (exito) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Notificación no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

