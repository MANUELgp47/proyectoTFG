import type {Request, Response} from 'express';
import * as ParticipacionModel from '../models/participacion.model.js';
import {actualizaEstadoParticipacion} from "../models/participacion.model.js";

export const getParticipaciones = async (req: Request, res: Response) => {
    try {
        const participacions = await ParticipacionModel.getAllParticipacions();
        res.json(participacions);
    } catch (error) {
        console.error('Error al obtener participacions:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getParticipacionPorId = async (req: Request, res: Response) => {
    const { idUsuario: idUsuarioStr, idActividad: idActividadStr } = req.params;

    if (!idUsuarioStr || !idActividadStr) {
        return res.status(400).json({ message: 'idUsuario e idActividad son requeridos' });
    }

    const idUsuario = parseInt(idUsuarioStr, 10);//
    const idActividad = parseInt(idActividadStr, 10);

    if (Number.isNaN(idUsuario) || Number.isNaN(idActividad)) {
        return res.status(400).json({ message: 'IDs inválidos' });
    }

    try {
        const participacion = await ParticipacionModel.getParticipacionPorId(idUsuario, idActividad);
        if (!participacion) {
            return res.status(404).json({ message: 'Participacion no encontrada' });
        }
        res.json(participacion);
    } catch (error) {
        console.error('Error al obtener participacion:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getParticipacionesPorActividad = async (req: Request, res: Response) => {
    const idActividad = req.params.idActividad;


    if (idActividad === undefined) {
        return res.status(400).json({ message: 'idUsuario e idActividad son requeridos' });
    }

    try {
        const participacions = await ParticipacionModel.getParticipacionesPorActividad(parseInt(idActividad, 10));
        res.json(participacions);
    } catch (error) {
        console.error('Error al obtener participacions por actividad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
//todas las participaciones de un usuario
export const getParticipacionesPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario;

    if (idUsuario === undefined) {
        return res.status(400).json({ message: 'idUsuario es requerido' });
    }

    try {
        const participacions = await ParticipacionModel.getParticipacionesPorUsuario(parseInt(idUsuario, 10));
        res.json(participacions);
    } catch (error) {
        console.error('Error al obtener participacions por usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createParticipacion = async (req: Request, res: Response) => {
    try {
        const participacion = await ParticipacionModel.crearParticipacion(req.body);
        res.status(201).json(participacion);
    } catch (error) {
        console.error('Error al crear participacion:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//Aceptar una participacion
export const aceptarParticipacion = async (req: Request, res: Response) => {
    const { idUsuario, idActividad , aceptada } = req.body;

    try {
        await ParticipacionModel.actualizaEstadoParticipacion(idUsuario, idActividad, aceptada);
        res.status(200).json({ message: 'Participacion aceptada' });
    } catch (error) {
        console.error('Error al aceptar participacion:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//Eliminar una participacion
export const eliminarParticipacion = async (req: Request, res: Response) => {
    const { idUsuario, idActividad } = req.body;

    try {
        await ParticipacionModel.eliminarParticipacion(idUsuario, idActividad);
        res.status(200).json({ message: 'Participacion eliminada' });
    } catch (error) {
        console.error('Error al eliminar participacion:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}