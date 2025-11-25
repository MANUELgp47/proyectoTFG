import type {Request, Response} from 'express';
import * as ActividadTagModel from '../models/actividadTag.model.js';



export const getTodosActividadTags = async (res: Response) => {
    try {
        const actividadTags = await ActividadTagModel.getAllActividadTags();
        res.json(actividadTags);
    } catch (error) {
        console.error('Error al obtener actividad tags:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
//obtiene los tag de una actividad concreta
export const getTagPorActividad = async (req: Request, res: Response) => {
    const actividadTags = await ActividadTagModel.getTagsActividad(req.body.idActividad);
    try {
        res.json(actividadTags);
    } catch (error) {
        console.error('Error al obtener tags de la actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const createActividadTag = async (req: Request, res: Response) => {
    try {
        const actividadTag = await ActividadTagModel.crearActividadTag(req.body);
        res.status(201).json(actividadTag);
    } catch (error) {
        console.error('Error al crear actividad tag:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};