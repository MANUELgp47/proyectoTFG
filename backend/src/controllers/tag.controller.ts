import type {Request, Response} from 'express';
import * as TagModel from '../models/tag.model.js';

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await TagModel.getAllTags();
        res.json(tags);
    } catch (error) {
        console.error('Error al obtener tags:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getTagById = async (req: Request, res: Response) => {
    try {
        const idTag = Number(req.params.idTag);
        const tag = await TagModel.getTagPorId(idTag);
        if (tag) {
            res.json(tag);
        } else {
            res.status(404).json({message: 'Tag no encontrado'});
        }
    } catch (error) {
        console.error('Error al obtener tag por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getTagByNombre = async (req: Request, res: Response) => {
    try {
        const nombre = req.params.nombre;

        if (!nombre) {
            return res.status(400).json({message: 'El nombre del tag es requerido'});
        }

        const tag = await TagModel.getTagPorNombre(nombre);
        if (tag) {
            res.json(tag);
        } else {
            res.status(404).json({message: 'Tag no encontrado'});
        }
    } catch (error) {
        console.error('Error al obtener tag por nombre:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getTagsByActividad = async (req: Request, res: Response) => {
    try {
        const idActividad = Number(req.params.idActividad);
        const tags = await TagModel.getTagsPorActividad(idActividad);
        res.json(tags);
    } catch (error) {
        console.error('Error al obtener tags por actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createTag = async (req: Request, res: Response) => {
    //No existe un tag igual
    const existeTag = await TagModel.getTagPorNombre(req.body.nombre);
    if (existeTag) {
        return res.status(400).json({message: 'Ya existe un tag con ese nombre'});
    }

    try {
        const tag = await TagModel.crearTag(req.body);
        res.status(201).json(tag);
    } catch (error) {
        console.error('Error al crear tag:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const deleteTag = async (req: Request, res: Response) => {
    //el tag existe
    const existeTag = await TagModel.getTagPorId(Number(req.params.idTag));
    if (!existeTag) {
        return res.status(404).json({message: 'Tag no encontrado'});
    }

    try {
        const idTag = Number(req.params.idTag);
        const eliminado = await TagModel.eliminarTag(idTag);
        if (eliminado) {
            res.status(200).json({message: 'Tag eliminado correctamente'});
        } else {
            res.status(404).json({message: 'Tag no encontrado'});
        }
    } catch (error) {
        console.error('Error al eliminar tag:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};