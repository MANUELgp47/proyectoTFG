// notificacion.service.ts
import type { CrearNotificacion } from '../types/notificacion.js';
import * as NotificacionModel from '../models/notificacion.model.js';
import type { Request } from 'express';

export class NotificacionService {
    static crearNotificacionCreacionActividad(actividad: any, req: Request) {
        if (!actividad) {
            console.error('No se pudo crear la notificación porque la actividad es undefined');
            return;
        }
        const notificacion: CrearNotificacion = {
            idUsuarioReceptor: req.body.idCreador,
            tipo: 'creacion_actividad',
            mensaje: `Se ha creado la actividad con nombre ${req.body.titulo}`,
            idReferencia: actividad.idActividad,
        };
        NotificacionModel.crearNotificacion(notificacion);
    }

    static creaNotificacionPorParametros(idUsuarioReceptor : number, tipo: CrearNotificacion['tipo'], mensaje: string, idReferencia: number) {
        const notificacion: CrearNotificacion = {
            idUsuarioReceptor,
            tipo,
            mensaje,
            idReferencia,
        };
        NotificacionModel.crearNotificacion(notificacion);
    }
}