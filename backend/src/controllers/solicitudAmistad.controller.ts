import type {Request, Response} from 'express';
import * as SolicitudAmistadModel from '../models/solicitudAmistad.model.js';

export const getAllSolicitudesAmistad = async (req: Request, res: Response) => {
    try {
        const solicitudes = await SolicitudAmistadModel.getAllSolicitudesAmistad();
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getSolicitudAmistad = async (req: Request, res: Response) => {
    const { idEmisor, idReceptor } = req.params;
    try {
        const solicitud = await SolicitudAmistadModel.getSolicitudAmistad(Number(idEmisor), Number(idReceptor));
        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud de amistad no encontrada' });
        }
        res.json(solicitud);
    } catch (error) {
        console.error('Error al obtener solicitud de amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getSolicitudesPorReceptor = async (req: Request, res: Response) => {
    const { idReceptor } = req.params;
    try {
        const solicitudes = await SolicitudAmistadModel.getSolicitudesPorReceptor(Number(idReceptor));
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad por receptor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const crearSolicitudAmistad = async (req: Request, res: Response) => {
    try {
        const nuevaSolicitud = await SolicitudAmistadModel.crearSolicitudAmistad(req.body);
        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        console.error('Error al crear solicitud de amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const actualizarEstadoSolicitudAmistad = async (req: Request, res: Response) => {
    const { idEmisor, idReceptor } = req.params;
    const { nuevoEstado } = req.body;
    try {
        const actualizado = await SolicitudAmistadModel.actualizarEstadoSolicitudAmistad(Number(idEmisor), Number(idReceptor), nuevoEstado);
        if (!actualizado) {
            return res.status(404).json({ message: 'Solicitud de amistad no encontrada' });
        }
        res.json({ message: 'Estado de la solicitud de amistad actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar estado de solicitud de amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const eliminarSolicitudAmistad = async (req: Request, res: Response) => {
    const { idEmisor, idReceptor } = req.params;
    try {
        const eliminado = await SolicitudAmistadModel.eliminarSolicitudAmistad(Number(idEmisor), Number(idReceptor));
        if (!eliminado) {
            return res.status(404).json({ message: 'Solicitud de amistad no encontrada' });
        }
        res.json({ message: 'Solicitud de amistad eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar solicitud de amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}