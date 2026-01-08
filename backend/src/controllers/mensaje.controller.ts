import type {Request, Response} from 'express';
import * as MensajedModel from '../models/mensaje.model.js';
import * as ChatIndividualModel from '../models/chatIndividual.model.js';
import * as ChatActividadModel from '../models/chatActividad.model.js';
import * as ParticipacionModel from '../models/participacion.model.js';
import {getActividadPorId} from "../models/actividad.model.js";
import * as chatActividadMoodell from "../models/chatActividad.model.js";
import * as ServicioUsuario from "../services/usuario.service.js";
import * as ServicioActividad from "../services/actividad.service.js";
import * as ServicioNotificacion from "../services/notificacion.service.js";
import * as ServicioChatActividad from "../services/chatActividad.service.js";

export const getMensajes = async (req: Request, res: Response) => {
    try {
        const mensajes = await MensajedModel.getAllMensajes();
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getMensajePorId = async (req: Request, res: Response) => {
    const idMensaje = Number(req.params.id);
    try {
        const mensaje = await MensajedModel.getMensajePorId(idMensaje);
        if (!mensaje) {
            return res.status(404).json({message: 'Mensaje no encontrado'});
        }
        res.json(mensaje);
    } catch (error) {
        console.error('Error al obtener mensaje por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getMensajesPorChatIndividual = async (req: Request, res: Response) => {
    const idChatIndividual = Number(req.params.idChatIndividual);
    try {
        const mensajes = await MensajedModel.getMensajesPorChatIndividual(idChatIndividual);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat individual:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getMensajesPorChatActividad = async (req: Request, res: Response) => {
    const idChatActividad = Number(req.params.idChatActividad);
    try {
        const mensajes = await MensajedModel.getMensajesPorChatActividad(idChatActividad);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//función para comprobar si el emisor existe y si el chat individual o de actividad existe
const comprobarEmisorChat = async (idEmisor: number, idChatIndividual?: number, idChatActividad?: number): Promise<boolean> => {
    //comprobar emisor
    if (!(await ServicioUsuario.UsuarioService.existeUsuarioPorId(idEmisor))) {
        console.log({message: 'Emisor no encontrado'});
        return false;
    }
    //comprobar chat individual o de actividad
    if (idChatIndividual) {
        //comprobar que existe el chat individual
        const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
        if (!chatIndividual) {
            console.log({message: 'Chat individual no encontrado'});
            return false;
        }
        //comprobar que el emisor es uno de los participantes
        if (idEmisor !== chatIndividual.idUsuario1 && idEmisor !== chatIndividual.idUsuario2) {
            console.log({message: 'El emisor no es participante del chat individual'});
            return false;
        }

    } else if (idChatActividad) {
        //comprobar que existe el chat de actividad
        const chatActividad = await ChatActividadModel.getChatActividadPorId(idChatActividad);
        if (!chatActividad) {
            console.log({message: 'Chat de actividad no encontrado'});
            return false;
        }
        //comprobar que el emisor participa en la actividad
        const actividad = await ServicioActividad.ActividadService.esUsuarioParticipante(chatActividad.idActividad, idEmisor);
        if (!actividad) {
            console.log({message: 'El emisor no participa en la actividad'});
            return false;
        }
    } else {
        console.log({message: 'Debe especificar un idChatIndividual o idChatActividad'});
        return false;
    }

    return true;

}

//crear mensaje
export const createMensaje = async (req: Request, res: Response) => {
    try {
        //TODO: Funciona? : comprobar que exsite el chat y que existe el emisor (hace una función)

        //comprobar emisor
        const esValido = await comprobarEmisorChat(req.body.idEmisor, req.body.idChatIndividual, req.body.idChatActividad);
        if (!esValido) {
            return res.status(400).json({message: 'Datos inválidos: emisor o chat no encontrado'});
        }

        const mensaje = await MensajedModel.crearMensaje(req.body);

        /*
        //establece como ultinimo mensaje del chat individual o actividad
        if (mensaje.idChatIndividual) {
            //comprobar que existe el chat individual y que el emisor es uno de los participantes
            const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(mensaje.idChatIndividual);
            if (!chatIndividual) {
                return res.status(404).json({ message: 'Chat individual no encontrado' });
            }
            if (mensaje.idEmisor !== chatIndividual.idUsuario1 && mensaje.idEmisor !== chatIndividual.idUsuario2) {
                return res.status(403).json({ message: 'El emisor no es participante del chat individual' });
            }
            ChatIndividualModel.establecerUltimoMensaje(req.body.idChatIndividual,mensaje.idMensaje);
        } else if (mensaje.idChatActividad) {
            //comprobar que el emisor participa en la actividad
            if (!(await ServicioActividad.ActividadService.esUsuarioParticipante(req.body.idActividad, req.body.idEmisor) )) {
                return res.status(403).json({ message: 'El emisor no participa en la actividad del chat' });
            }else{
                ChatActividadModel.establecerUltimoMensaje(req.body.idChatActividad,mensaje.idMensaje);
            }

        }*/

        if (mensaje.idChatIndividual)
            ChatIndividualModel.establecerUltimoMensaje(req.body.idChatIndividual, mensaje.idMensaje);
        else if (mensaje.idChatActividad)
            ChatActividadModel.establecerUltimoMensaje(req.body.idChatActividad, mensaje.idMensaje);

        //TODO FUNCIONA?: Notifica al emisor del mensaje (pendiente de implementar)

        ServicioNotificacion.NotificacionService.crearNotificacionNuevoMensaje(req.body);


        res.status(201).json(mensaje);
    } catch (error) {
        console.error('Error al crear mensaje:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};


//updateMensaje solo si no está leído
export const updateMensaje = async (req: Request, res: Response) => {
    const idMensaje = Number(req.params.id);
    const {contenido, leido} = req.body;
    try {
        const mensajeExistente = await MensajedModel.getMensajePorId(idMensaje);
        if (!mensajeExistente) {
            return res.status(404).json({message: 'Mensaje no encontrado'});
        }
        //solo se puede actualizar el contenido si no está leído
        if (mensajeExistente.leido && contenido) {
            return res.status(400).json({message: 'No se puede modificar el contenido de un mensaje ya leído'});
        }
        const mensajeActualizado = {
            ...mensajeExistente,//... para mantener los campos no modificados
            contenido: contenido ?? mensajeExistente.contenido,
            leido: leido ?? mensajeExistente.leido,
        };

        const mensaje = await MensajedModel.actualizarMensaje(idMensaje, mensajeActualizado.contenido);
        res.json(mensaje);
    } catch (error) {
        console.error('Error al actualizar mensaje:', error);
        res.status(500).json({message: 'Error del servidor'});

    }
}


export const deleteMensaje = async (req: Request, res: Response) => {
    const idMensaje = Number(req.params.id);
    try {
        const exito = await MensajedModel.eliminarMensaje(idMensaje);
        if (!exito) {
            return res.status(404).json({message: 'Mensaje no encontrado'});
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}