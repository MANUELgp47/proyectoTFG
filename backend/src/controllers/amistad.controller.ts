import type {Request, Response} from 'express';
import * as AmistadModel from '../models/amistad.model.js';

export const getAmistades = async (req: Request, res: Response) => {
    try {
        const amistades = await AmistadModel.getAllAmistad();
        res.json(amistades);
    } catch (error) {
        console.error('Error al obtener amistades:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
//amistad por usuarios
export const getAmistadPorUsuarios = async (req: Request, res: Response) => {
    const {idUsuario1, idUsuario2} = req.params;
    try {
        const amistad = await AmistadModel.getAmistadPorUsuarios(Number(idUsuario1), Number(idUsuario2));
        if (amistad) {
            res.json(amistad);
        } else {
            res.status(404).json({ message: 'Amistad no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todas las amistades de un usuario
export const getAmistadesPorUsuario = async (req: Request, res: Response) => {
    const {idUsuario} = req.params;
    try {
        const amistades = await AmistadModel.getAmistadesPorUsuario(Number(idUsuario));
        res.json(amistades);
    } catch (error) {
        console.error('Error al obtener amistades del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createAmistad = async (req: Request, res: Response) => {
    try {
        const amistad = await AmistadModel.crearAmistad(req.body.idUsuario1, req.body.idUsuario2);
        res.status(201).json(amistad);
    } catch (error) {
        console.error('Error al crear amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//elimina una amistad por los ids de los usuarios
export const deleteAmistad = async (req: Request, res: Response) => {
    const {idUsuario1, idUsuario2} = req.params;
    try {
        const eliminado = await AmistadModel.eliminarAmistad(Number(idUsuario1), Number(idUsuario2));
        if (eliminado) {
            res.json({ message: 'Amistad eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Amistad no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};