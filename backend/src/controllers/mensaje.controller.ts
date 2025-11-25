import type {Request, Response} from 'express';
import * as MensajedModel from '../models/mensaje.model.js';

export const getMensajes = async (req: Request, res: Response) => {
    try {
        const mensajes = await MensajedModel.getAllMensajes();
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getMensajePorId = async (req: Request, res: Response) => {
    const idMensaje = parseInt(req.params.id);
    try {
        const mensaje = await MensajedModel.getMensajePorId(idMensaje);
        if (!mensaje) {
            return res.status(404).json({ message: 'Mensaje no encontrado' });
        }
        res.json(mensaje);
    } catch (error) {
        console.error('Error al obtener mensaje por ID:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getMensajesPorChatIndividual = async (req: Request, res: Response) => {
    const idChatIndividual = parseInt(req.params.idChatIndividual);
    try {
        const mensajes = await MensajedModel.getMensajesPorChatIndividual(idChatIndividual);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat individual:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getMensajesPorChatActividad = async (req: Request, res: Response) => {
    const idChatActividad = parseInt(req.params.idChatActividad);
    try {
        const mensajes = await MensajedModel.getMensajesPorChatActividad(idChatActividad);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat de actividad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const createMensaje = async (req: Request, res: Response) => {
    try {
        const mensaje = await MensajedModel.crearMensaje(req.body);
        res.status(201).json(mensaje);
    } catch (error) {
        console.error('Error al crear mensaje:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const deleteMensaje = async (req: Request, res: Response) => {
    const idMensaje = parseInt(req.params.id);
    try {
        const exito = await MensajedModel.eliminarMensaje(idMensaje);
        if (!exito) {
            return res.status(404).json({ message: 'Mensaje no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}