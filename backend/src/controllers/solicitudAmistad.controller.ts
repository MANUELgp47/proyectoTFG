import type {Request, Response} from 'express';
import * as SolicitudAmistadModel from '../models/solicitudAmistad.model.js';
import * as NotificacionService from '../services/notificacion.service.js';
import * as UsuarioModel from '../models/usuario.model.js';
import * as AmistadModel from '../models/amistad.model.js';

export const getAllSolicitudesAmistad = async (req: Request, res: Response) => {
    try {
        const solicitudes = await SolicitudAmistadModel.getAllSolicitudesAmistad();
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getSolicitudAmistad = async (req: Request, res: Response) => {
    const {idEmisor, idReceptor} = req.params;
    try {
        const solicitud = await SolicitudAmistadModel.getSolicitudAmistad(Number(idEmisor), Number(idReceptor));
        if (!solicitud) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        res.json(solicitud);
    } catch (error) {
        console.error('Error al obtener solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getSolicitudesPorReceptor = async (req: Request, res: Response) => {
    const {idReceptor} = req.params;
    try {
        const solicitudes = await SolicitudAmistadModel.getSolicitudesPorReceptor(Number(idReceptor));
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad por receptor:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const crearSolicitudAmistad = async (req: Request, res: Response) => {
    try {
        const estado = await SolicitudAmistadModel.getSolicitudAmistad(req.body.idEmisor,req.body.idReceptor);
        const rechazado: 'rechazada' = 'rechazada';

        if (estado?.estado == rechazado) {//si ya habia una solicitud rechazada, se elimina y se crea una nueva
            await SolicitudAmistadModel.eliminarSolicitudAmistad(req.body.idEmisor, req.body.idReceptor);
        }
        const nuevaSolicitud = await SolicitudAmistadModel.crearSolicitudAmistad(req.body);

        //Obtener nombre de usuario receptor
        const receptor = await UsuarioModel.getUsuarioPorId(req.body.idEmisor);
        const usuarioEmisor = receptor ? receptor.nombreUsuario : 'Usuario desconocido';
        //Notifica al receptor de la nueva solicitud de amistad
        await NotificacionService.NotificacionService.creaNotificacionPorParametros(
            req.body.idReceptor,
            'solicitud_amistad',
            `Tienes una nueva solicitud de amistad de parte del usuario  ${usuarioEmisor}`,
            nuevaSolicitud.idEmisor
        );

        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        console.error('Error al crear solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const actualizarEstadoSolicitudAmistad = async (req: Request, res: Response) => {
    const {idEmisor, idReceptor} = req.params;
    const nuevoEstado = req.body.estado;
    try {
        const actualizado = await SolicitudAmistadModel.actualizarEstadoSolicitudAmistad(Number(idEmisor), Number(idReceptor), nuevoEstado);
        if (!actualizado) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        //crea amistad si la solicitud fue aceptada
        if (nuevoEstado === 'aceptada') {
            await AmistadModel.crearAmistad(Number(idEmisor), Number(idReceptor));

            //Notifica al emisor que su solicitud fue aceptada
            const receptor = await UsuarioModel.getUsuarioPorId(Number(idReceptor));
            const usuarioRe =  receptor ? receptor.nombreUsuario : 'Usuario desconocido';//TODO el usuario sale como desconocido, arreglar

            await NotificacionService.NotificacionService.creaNotificacionPorParametros(
                Number(idEmisor),
                'solicitud_amistad',
                `Tu solicitud de amistad ha sido aceptada por el usuario ${usuarioRe}`,
                Number(idReceptor)
            )
        }

        res.json({message: 'Estado de la solicitud de amistad actualizado correctamente'});
    } catch (error) {
        console.error('Error al actualizar estado de solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const eliminarSolicitudAmistad = async (req: Request, res: Response) => {
    const {idEmisor, idReceptor} = req.params;
    try {
        const eliminado = await SolicitudAmistadModel.eliminarSolicitudAmistad(Number(idEmisor), Number(idReceptor));
        if (!eliminado) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        res.json({message: 'Solicitud de amistad eliminada correctamente'});
    } catch (error) {
        console.error('Error al eliminar solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}