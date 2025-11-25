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
        const amistad = await AmistadModel.crearAmistad(req.body);
        res.status(201).json(amistad);
    } catch (error) {
        console.error('Error al crear amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};