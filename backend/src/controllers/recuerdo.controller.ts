import type {Request, Response} from 'express';
import * as RecuerdoModel from '../models/recuerdo.model.js';

export const getRecuerdos = async (req: Request, res: Response) => {
    try {
        const recuerdos = await RecuerdoModel.getAllRecuerdos();
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getRecuerdoPorId = async (req: Request, res: Response) => {
    const idRecuerdo = parseInt(req.params.id);
    try {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        if (!recuerdo) {
            return res.status(404).json({ message: 'Recuerdo no encontrado' });
        }
        res.json(recuerdo);
    } catch (error) {
        console.error('Error al obtener recuerdo por ID:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getRecuerdosPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = parseInt(req.params.idUsuario);
    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorUsuario(idUsuario);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getRecuerdosPorActividad = async (req: Request, res: Response) => {
    const idActividad = parseInt(req.params.idActividad);
    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorActividad(idActividad);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por actividad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createRecuerdo = async (req: Request, res: Response) => {
    try {
        const recuerdo = await RecuerdoModel.crearRecuerdo(req.body);
        res.status(201).json(recuerdo);
    } catch (error) {
        console.error('Error al crear recuerdo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};