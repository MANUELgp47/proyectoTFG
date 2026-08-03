import type {Request, Response} from 'express';
import * as NotificacionModel from '../models/notificacion.model.js';
import {UsuarioService} from "../services/usuario.service.js";
import {ActividadService} from "../services/actividad.service.js";
import {ComentarioService} from "../services/comentario.service.js";
import {RecuerdoService} from "../services/recuerdo.service.js";
//marcar notificación como leída

export const getNotificaciones = async (req: Request, res: Response) => {
    try {
        const notifiacciones = await NotificacionModel.getAllNotificaciones();
        res.json(notifiacciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getNotificacionById = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;

    //TODO: validar que el idNotificacion sea un número y que pertenezca al usuario autenticado

    if (idNotificacion === undefined || isNaN(Number(idNotificacion))) {
        return res.status(400).json({message: 'idNotificacion es requerido'});
    }

    try {
        const notificacion = await NotificacionModel.getNotificacionPorId(Number(idNotificacion));
        if (notificacion) {
            res.json(notificacion);
        } else {
            res.status(404).json({message: 'Notificación no encontrada'});
        }
    } catch (error) {
        console.error('Error al obtener notificación:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getNotificacionesPorUsuario = async (req: Request, res: Response) => {
    const idUsuarioReceptor = req.userId;


    if (idUsuarioReceptor === undefined) {
        return res.status(400).json({message: 'idUsuarioReceptor es requerido'});
    }


    try {
        const notificacions = await NotificacionModel.getNotificacionesPorUsuario(Number(idUsuarioReceptor));
        res.json(notificacions);
    } catch (error) {
        console.error('Error al obtener notificaciones por usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createNotificacion = async (req: Request, res: Response) => {
    try {
        const notificacion = await NotificacionModel.crearNotificacion(req.body);
        res.status(201).json(notificacion);
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//denuncia
export const createDenuncia = async (req: Request, res: Response) => {
    try {
        console.log("Creando denuncia ");
        const idDenunciante = Number(req.userId);
        const idReferencia = Number(req.body.idReferencia);
        console.log("Body de la denuncia:", req.body);

        //comprueba la referencia segun el tipo (actividad, usuario, comentario, recuerdo)
        let tipoMensaje: string;
        switch (req.body.tipo) {
            case 'denuncia_actividad':
                const existeActividad = await ActividadService.existeActividad(idReferencia);
                tipoMensaje = 'Actividad';
                if (!existeActividad) {
                    return res.status(404).json({message: 'Actividad no encontrada'});
                }
                break;
            case 'denuncia_usuario':
                const existeUsuario = await UsuarioService.existeUsuarioPorId(idReferencia);
                tipoMensaje = 'Usuario';
                if (!existeUsuario) {
                    return res.status(404).json({message: 'Usuario no encontrado'});
                }
                break;
            case 'denuncia_comentario':
                const existeComentario = await ComentarioService.existeComentario(idReferencia);
                tipoMensaje = 'Comentario';
                if (!existeComentario) {
                    return res.status(404).json({message: 'Comentario no encontrado'});
                }
                break;
            case 'denuncia_recuerdo':
                const existeRecuerdo = await RecuerdoService.existeRecuerdo(idReferencia);
                tipoMensaje = 'Recuerdo';
                if (!existeRecuerdo) {
                    return res.status(404).json({message: 'Recuerdo no encontrado'});
                }
                break;
            default:
                return res.status(400).json({message: 'Tipo de referencia no válido'});
        }


        //Buscarlos por rol no por id. Todos los admins y moderadores reciben la denuncia
        const listaModeradoresYAdmins = await UsuarioService.obtenerUsuariosPorRol(['admin', 'mod']);
        const idUsuariosReceptores = listaModeradoresYAdmins.map(usuario => usuario.idUsuario);

        //Crea las notificaciones para cada admin y moderador
        const NombreUsuarioDenunciante = await UsuarioService.getNombreUsuarioPorId(idDenunciante);
        const notificaciones = await Promise.all(idUsuariosReceptores.map(idUsuarioReceptor => {
            return NotificacionModel.crearNotificacion({
                idUsuarioReceptor: idUsuarioReceptor,
                mensaje: `Nueva denuncia en ${tipoMensaje} por parte del usuario ${NombreUsuarioDenunciante}: ${req.body.mensaje}`,
                tipo: req.body.tipo,
                idReferencia: idReferencia,
                idUsuarioEmisor: idDenunciante,
            });
        }));

        res.status(201).json(notificaciones);


    } catch (error) {
        console.error('Error al crear denuncia:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}


// Actualizar una notificación por id
export const updateNotificacion = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;
    const idUsuario = req.userId;

    if (idNotificacion === undefined) {
        return res.status(400).json({message: 'idNotificacion es requerido'});
    }
    //existe la notificación
    const existe = await NotificacionModel.getNotificacionPorId(parseInt(idNotificacion, 10));
    if (!existe) {
        return res.status(404).json({message: 'Notificación no encontrada'});
    }
    //la notificación pertenece al usuario
    if (existe.idUsuarioReceptor !== idUsuario) {
        return res.status(403).json({message: 'No tienes permiso para marcar esta notificación como leída'});
    }

    try {
        const notificacionActualizada = await NotificacionModel.marcaLeidaNotificacion(parseInt(idNotificacion, 10), true);
        if (notificacionActualizada) {
            res.json(notificacionActualizada);
        } else {
            res.status(404).json({message: 'Notificación no encontrada'});
        }
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const deleteNotificacion = async (req: Request, res: Response) => {
    const idNotificacion = req.params.idNotificacion;
    const idUsuario = req.userId;

    if (idNotificacion === undefined) {
        return res.status(400).json({message: 'idNotificacion es requerido'});
    }

    //existe la notificación
    const existe = await NotificacionModel.getNotificacionPorId(parseInt(idNotificacion, 10));
    if (!existe) {
        return res.status(404).json({message: 'Notificación no encontrada'});
    }
    //la notificación pertenece al usuario
    if (existe.idUsuarioReceptor !== idUsuario) {
        return res.status(403).json({message: 'No tienes permiso para eliminar esta notificación '});
    }


    try {
        const exito = await NotificacionModel.eliminarNotificacion(parseInt(idNotificacion, 10));
        if (exito) {
            res.status(204).send();
        } else {
            res.status(404).json({message: 'Notificación no encontrada'});
        }
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

