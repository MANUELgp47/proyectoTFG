// notificacion.service.ts
import type {CrearNotificacion} from '../types/notificacion.js';
import * as NotificacionModel from '../models/notificacion.model.js';
import type {Request} from 'express';
import {ActividadService} from "./actividad.service.js";
import {UsuarioService} from "./usuario.service.js";
import {ChatActividadService} from "./chatActividad.service.js";
import {ChatIndividualService} from "./chatIndividual.service.js";

export class NotificacionService {
    static crearNotificacionCreacionActividad(actividad: any, req: Request) {
        if (!actividad) {
            console.error('No se pudo crear la notificación porque la actividad es undefined');
            return;
        }
        const notificacion: CrearNotificacion = {
            idUsuarioEmisor: req.body.idEmisor,
            idUsuarioReceptor: req.body.idCreador,
            tipo: 'creacion_actividad',
            mensaje: `Se ha creado la actividad con nombre ${req.body.titulo}`,
            idReferencia: actividad.idActividad,
        };
        NotificacionModel.crearNotificacion(notificacion);
    }

    static creaNotificacionPorParametros(idUsuarioReceptor: number, tipo: CrearNotificacion['tipo'], mensaje: string, idReferencia: number) {
        const notificacion: CrearNotificacion = {
            idUsuarioEmisor: 0, // Ajustar según el contexto
            idUsuarioReceptor,
            tipo,
            mensaje,
            idReferencia,
        };
        NotificacionModel.crearNotificacion(notificacion);
    }

    //notificación chat mensaje
    static async crearNotificacionNuevoMensaje(body: any) {
        const NombreEmisor = await UsuarioService.getNombreUsuarioPorId(body.idEmisor);

        //comprobar si es chat individual o de actividad
        if (body.idChatActividad) {
            const idActividad = await ChatActividadService.getIdActividadPorIdChatActividad(body.idChatActividad);
            if (idActividad === undefined || idActividad === null) {
                console.error('No se pudo crear la notificación porque el idActividad es undefined');
                return;
            }
            const NombreActividad = await ActividadService.getNombreActividad(idActividad);

            //for que notifica a todos los participantes de la actividad menos al emisor
            for (const participante of await ActividadService.getUsuariosParticipantes(idActividad)) {
                if (participante !== body.idEmisor) {

                    //notificación
                    const notificacion: CrearNotificacion = {
                        idUsuarioEmisor: body.idEmisor,
                        idUsuarioReceptor: participante,
                        tipo: 'chat_actividad',
                        mensaje: `Tienes un nuevo mensaje de usuario ${NombreEmisor} en el chat de la actividad ${NombreActividad}`,
                        idReferencia: body.idChatActividad,
                    };
                    NotificacionModel.crearNotificacion(notificacion);
                }
            }

        } else if (body.idChatIndividual) {

            //obtener el id del otro usuario del chat individual
            const usuariosChat = await ChatIndividualService.getUsuariosPorIdChatIndividual(body.idChatIndividual);
            if (!usuariosChat) {
                console.error('No se pudo crear la notificación porque no se encontraron los usuarios del chat individual');
                return;
            }
            const idUsuarioReceptor = usuariosChat.idUsuario1 === body.idEmisor ? usuariosChat.idUsuario2 : usuariosChat.idUsuario1;


            /*
            TODO: comprueba si el buzon está lleno
                1. Servicio mensje que cuente los mensajes de un chat sin leer por el usuario
                2. Si el el numero supera el umbral establecido no crea notificación
                3. si no tiene notificación de buzon crea la notificación "tiene mas de X mensajes sin leer" de tipo chat_individual_lleno
             */

            //notificación
            const notificacion: CrearNotificacion = {
                idUsuarioEmisor: body.idEmisor,
                idUsuarioReceptor,
                tipo: 'chat_individual',
                mensaje: `Tienes un nuevo mensaje de usuario ${NombreEmisor}`,
                idReferencia: body.idChatIndividual,
            };
            NotificacionModel.crearNotificacion(notificacion);

        }

    }
}