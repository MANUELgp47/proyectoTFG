import type {Request, Response} from 'express';
import * as RecuerdoModel from '../models/recuerdo.model.js';
import * as NotificacionService from '../services/notificacion.service.js';
import * as ActividadModel from '../models/actividad.model.js';
import * as UsuarioModel from '../models/usuario.model.js';

export const getRecuerdos = async (req: Request, res: Response) => {
    try {
        const recuerdos = await RecuerdoModel.getAllRecuerdos();
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdoPorId = async (req: Request, res: Response) => {
    const idRecuerdo = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (undefined === idRecuerdo) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        if (!recuerdo) {
            return res.status(404).json({message: 'Recuerdo no encontrado'});
        }
        res.json(recuerdo);
    } catch (error) {
        console.error('Error al obtener recuerdo por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdosPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario ? parseInt(req.params.idUsuario, 10) : NaN;
    if (undefined === idUsuario) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorUsuario(idUsuario);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdosPorActividad = async (req: Request, res: Response) => {
    const idActividad = req.params.idActividad ? parseInt(req.params.idActividad, 10) : NaN;
    if (undefined === idActividad) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorActividad(idActividad);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createRecuerdo = async (req: Request, res: Response) => {

    try {
        const recuerdo = await RecuerdoModel.crearRecuerdo(req.body);
        res.status(201).json(recuerdo);
    } catch (error) {
        console.error('Error al crear recuerdo:', error);
        res.status(500).json({message: 'Error del servidor'});
    }


    //Notifica la creacion del recuerdo a los usuarios participantes de la actividad

    let tipoNot: 'creacion_recuerdo' = 'creacion_recuerdo';
    //get nombre actividad
    const actividad  = await ActividadModel.getActividadPorId(req.body.idActividad);
    const nombreActividad = actividad ? actividad.titulo : 'desconocida';
    //nombre usuario que crea el recuerdo
    const usuario = await UsuarioModel.getUsuarioPorId(req.body.idUsuario) ;
    const nomUsuario = usuario ? usuario.nombreUsuario : 'desconocido';

    //obtener participantes
    const participantes = await ActividadModel.getParticipantesDeActividad(req.body.idActividad);

    participantes.forEach(participante => {

        console.log(`Participante id ${participante}`);

        if (req.body.idUsuario === participante) {// si es el creador del recuerdo
            NotificacionService.NotificacionService.creaNotificacionPorParametros(
                participante,
                tipoNot,
                `Usted ha creado un nuevo recuerdo titulado ${req.body.titulo} de la actividad ${nombreActividad}`,
                req.body.idActividad
            );
        } else {
            NotificacionService.NotificacionService.creaNotificacionPorParametros(
                participante,
                tipoNot,
                `El usuario ${nomUsuario} te ha etiquetado en un recuerdo sobre la actividad ${nombreActividad}`,
                req.body.idActividad
            );
        }

    });


};

export const deleteRecuerdoPorId = async (req: Request, res: Response) => {
    const idRecuerdo = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (isNaN(idRecuerdo)) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const deleted = await RecuerdoModel.deleteRecuerdoPorId(idRecuerdo);
        if (deleted) {
            res.json({message: 'Recuerdo eliminado correctamente'});
        } else {
            res.status(404).json({message: 'Recuerdo no encontrado'});
        }
    } catch (error) {
        console.error('Error al eliminar recuerdo por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//TODO: actualizar recuerdo (Pensar primero si dar esa funcionalidad)