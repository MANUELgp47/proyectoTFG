import type {Request, Response} from 'express';
import * as ActividadModel from '../models/actividad.model.js';
import * as NotificacionModel from '../models/notificacion.model.js';
import type {CrearNotificacion} from "../types/notificacion.js";
//importa el tipo notificacion


export const getActividades = async (req: Request, res: Response) => {
    try {
        const actividads = await ActividadModel.getAllActividads();
        res.json(actividads);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
//TODO.
// ver como pasarle el id creador
export const createActividad = async (req: Request, res: Response) => {
    let actividad;
    try {
        actividad = await ActividadModel.crearActividad(req.body);
        res.status(201).json(actividad);
    } catch (error) {
        console.error('Error al crear actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

    if (actividad !== undefined) {
        const notificacion: CrearNotificacion = {
            idUsuarioReceptor: req.body.idCreador,
            tipo: 'creacion_actividad',
            mensaje: `Se ha creado la actividad con nombre ${req.body.titulo}`,
            idReferencia: actividad.idActividad, //id de la actividad creada actividad.idActividad
        };

        NotificacionModel.crearNotificacion(notificacion);
    }else{
        console.error('No se pudo crear la notificación porque la actividad es undefined');
    }





};

//actualizar actividad
//establecer campos no actualizables
export const updateActividad = async (req: Request, res: Response) => {
    let idActividad;
    try {
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        idActividad = Number.parseInt(idParam, 10);
        if (Number.isNaN(idActividad)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const actividadActualizado = await ActividadModel.actualizarActividad(idActividad, req.body);
        if (actividadActualizado) {
            res.json(actividadActualizado);
        } else {
            res.status(404).json({message: 'Actividad no encontrado'});
        }
    } catch (error) {
        console.error('Error al actualizar Actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

    //NOTIFICACION DE ACTUALIZACION DE ACTIVIDAD
    if (idActividad !== undefined) {
        const notificacion: CrearNotificacion = {
            idUsuarioReceptor: req.body.idCreador,
            tipo: 'actualizacion_actividad',
            mensaje: `Se ha actualizado la actividad con nombre ${req.body.nombre}`,
            idReferencia: idActividad, //id de la actividad creada actividad.idActividad
        };

        NotificacionModel.crearNotificacion(notificacion);
    }else{
        console.error('No se pudo crear la notificación porque la actividad es undefined');
    }

};

//Eliminar actividad
export const deleteActividad = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {// si no hay id en los parametros
            return res.status(400).json({message: 'ID requerido'});
        }
        const idActividad = Number.parseInt(idParam, 10);//10 para indicar que es base decimal
        if (Number.isNaN(idActividad)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const eliminado = await ActividadModel.eliminarActividad(idActividad);
        if (eliminado) {// si se elimino correctamente
            res.json({message: 'Actividad eliminada correctamente'});
        } else {
            res.status(404).json({message: 'Actividad no encontrada'});
        }
    } catch (error) {
        console.error('Error al eliminar Actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};