import type {Request, Response} from 'express';
import * as ActividadTagModel from '../models/actividadTag.model.js';
import {eliminarActividadTag} from "../models/actividadTag.model.js";
import * as TagService from "../services/tag.service.js";
import * as ActividadService from "../services/actividad.service.js";



export const getTodosActividadTags = async (req: Request ,res: Response) => {
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

    const idUsuario = req.userId;
    const idActividad = req.body.idActividad;
    const existeTag = await TagService.TagService.existeTagPorid(req.body.idTag);
    const existeActividad = await ActividadService.ActividadService.existeActividad(idActividad);

    //valida los id usuario
    if (!idUsuario || isNaN(idUsuario)) {
        return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    //Existe el tag
    if (!existeTag) {
        return res.status(400).json({ message: 'El tag no existe' });
    }
    //existe la actividad
    if (!existeActividad) {
        return res.status(400).json({ message: 'La actividad no existe' });
    }
    //el usuario es el creador de la actividad
    const esCreador = await ActividadService.ActividadService.esCreadorActividad(idActividad, idUsuario);
    if (!esCreador) {
        return res.status(403).json({ message: 'No tienes permiso para asignar tags a esta actividad' });
    }
    //existe la actividad tag
    const actividadTags = await ActividadTagModel.getTagsActividad(idActividad);
    const existeActividadTag = actividadTags.find(at => at.idTag === parseInt(req.body.idTag));
    if (existeActividadTag) {
        return res.status(400).json({ message: 'El tag ya está asignado a la actividad' });
    }


    try {
        const actividadTag = await ActividadTagModel.crearActividadTag(req.body);
        res.status(201).json(actividadTag);
    } catch (error) {
        console.error('Error al crear actividad tag:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//Eliminar un tag de una actividad por id
export const deleteActividadTag = async (req: Request, res: Response) => {

    const idUsuario = req.userId;
    const idActividad = req.body.idActividad;
    const existeTag = await TagService.TagService.existeTagPorid(req.body.idTag);
    const existeActividad = await ActividadService.ActividadService.existeActividad(idActividad);

    //valida los id usuario
    if (!idUsuario || isNaN(idUsuario)) {
        return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    //Existe el tag
    if (!existeTag) {
        return res.status(400).json({ message: 'El tag no existe' });
    }
    //existe la actividad
    if (!existeActividad) {
        return res.status(400).json({ message: 'La actividad no existe' });
    }
    //el usuario es el creador de la actividad
    const esCreador = await ActividadService.ActividadService.esCreadorActividad(idActividad, idUsuario);
    if (!esCreador) {
        return res.status(403).json({ message: 'No tienes permiso para asignar tags a esta actividad' });
    }

    //existe la actividad tag
    const actividadTags = await ActividadTagModel.getTagsActividad(idActividad);
    const existeActividadTag = actividadTags.find(at => at.idTag === parseInt(req.body.idTag));
    if (!existeActividadTag) {
        return res.status(400).json({ message: 'El tag no está asignado a la actividad' });
    }
    try {
        await ActividadTagModel.eliminarActividadTag(parseInt(req.body.idActividad), parseInt(req.body.idTag));
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar actividad tag:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}