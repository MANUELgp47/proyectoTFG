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
import {marcarMensajeLeidoPorChatIndividual} from "../models/mensaje.model.js";
import * as SettingsService from "../services/settingsService.js";
import * as ServicioChatIndividual from "../services/chatIndividual.service.js";
import * as UsuarioService from "../services/usuario.service.js";

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

    //


    try {
        const mensaje = await MensajedModel.getMensajePorId(idMensaje);
        if (!mensaje) {
            return res.status(404).json({message: 'Mensaje no encontrado'});
        }

        //comprueba que el usuario que solicita el mensaje está en el chat individual o de actividad al que pertenece el mensaje
        if (mensaje.idChatIndividual) {
            const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(mensaje.idChatIndividual);
            if (!chatIndividual) {
                return res.status(404).json({message: 'Chat individual no encontrado'});
            }
            if (req.userId !== chatIndividual.idUsuario1 && req.userId !== chatIndividual.idUsuario2) {
                return res.status(403).json({message: 'No tienes permiso para ver este mensaje'});
            }
        } else if (mensaje.idChatActividad) {
            const chatActividad = await ChatActividadModel.getChatActividadPorId(mensaje.idChatActividad);
            if (!chatActividad) {
                return res.status(404).json({message: 'Chat de actividad no encontrado'});
            }
            const estaEnActividad = await ServicioActividad.ActividadService.esUsuarioParticipante(chatActividad.idActividad, Number(req.userId));
            if (!estaEnActividad) {
                return res.status(403).json({message: 'No tienes permiso para ver este mensaje'});
            }
        } else {
            return res.status(400).json({message: 'Mensaje no asociado a ningún chat'});
        }


        res.json(mensaje);
    } catch (error) {
        console.error('Error al obtener mensaje por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const getMensajesPorChatIndividual = async (req: Request, res: Response) => {
    const idChatIndividual = Number(req.params.idChatIndividual);
    const idUsuario = req.userId;

    //comprobar que el chat individual existe y que el usuario es uno de los participantes
    const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(idChatIndividual);
    if (!chatIndividual) {
        return res.status(404).json({message: 'Chat individual no encontrado'});
    }
    if (idUsuario !== chatIndividual.idUsuario1 && idUsuario !== chatIndividual.idUsuario2) {
        return res.status(403).json({message: 'No tienes permiso para ver los mensajes de este chat individual'});
    }


    try {
        const mensajes = await MensajedModel.getMensajesPorChatIndividual(idChatIndividual);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat individual:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
//get mensajes por chat de actividad
export const getMensajesPorChatActividad = async (req: Request, res: Response) => {
    const idChatActividad = Number(req.params.idChatActividad);
    const idUsuario = Number(req.userId);

    //comprobar que el chat de actividad existe y que el usuario participa en la actividad
    const chatActividad = await ChatActividadModel.getChatActividadPorId(idChatActividad);
    if (!chatActividad) {
        return res.status(404).json({message: 'Chat de actividad no encontrado'});
    }
    const estaEnActividad = await ServicioActividad.ActividadService.esUsuarioParticipante(chatActividad.idActividad, idUsuario);
    if (!estaEnActividad) {
        return res.status(403).json({message: 'No tienes permiso para ver los mensajes de este chat de actividad'});
    }

    try {
        const mensajes = await MensajedModel.getMensajesPorChatActividad(idChatActividad);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes por chat de actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}

//función para comprobar si el emisor existe y si el chat individual o de actividad existe TODO: Hacer en servicio
const comprobarEmisorChat = async (idEmisor: number, idChatIndividual?: number, idChatActividad?: number): Promise<boolean> => {
    //comprobar emisor existe
    if (!(await ServicioUsuario.UsuarioService.existeUsuarioPorId(idEmisor))) {
        console.log({message: 'Emisor no encontrado'});
        return false;
    }
    //comprobar chat individual o de actividad existe y que el emisor pertenece al chat
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

        const idEmisor = req.userId;
        //valida idEmisor
        if (!idEmisor) {
            return res.status(400).json({message: 'ID de emisor inválido'});
        }

        //comprobar emisor
        const esValido = await comprobarEmisorChat(idEmisor, req.body.idChatIndividual, req.body.idChatActividad);
        if (!esValido) {
            return res.status(400).json({message: 'Datos inválidos: emisor o chat no encontrado'});
        }


        //el usuario no está baneado
        const estaBaneado = await UsuarioService.UsuarioService.getRolPorIdUsuario(idEmisor);
        if (estaBaneado === 'baneado') {
            return res.status(403).json({message: 'El usuario está baneado y mandar mensajes no está permitido'});
        }


        //valida contenido no vacío
        if (req.body.contenido == null || req.body.contenido.trim() === '') {
            return res.status(400).json({message: 'El contenido del mensaje no puede estar vacío'});
        }


        //es chat individual? Compruebo que no hay bloqueo entre los usuarios
        if (req.body.idChatIndividual) {


            const usuariosChat = await ServicioChatIndividual.ChatIndividualService.getUsuariosPorIdChatIndividual(req.body.idChatIndividual);

            //ninguno está baneado?
            const rolUsuario1 = await UsuarioService.UsuarioService.getRolPorIdUsuario(usuariosChat!.idUsuario1);
            const rolUsuario2 = await UsuarioService.UsuarioService.getRolPorIdUsuario(usuariosChat!.idUsuario2);
            if (rolUsuario1 === 'baneado' || rolUsuario2 === 'baneado') {
                return res.status(403).json({message: 'Uno de los usuarios del chat está baneado y mandar mensajes no está permitido'});
            }

            //permiso? Compruebo (en caso de ser chat individual) que no hay bloqueo por ninguno de los usuarios
            const bloqueo = await SettingsService.SettingsService.hayBloqueoEntreUsuarios(usuariosChat!.idUsuario1, usuariosChat!.idUsuario2);
            if (bloqueo) {
                return res.status(403).json({message: 'No puedes enviar mensajes en este chat porque hay un bloqueo entre los usuarios'});
            }
        }else{
            //existe el chat de actividad?
            const chatActividad = await chatActividadMoodell.getChatActividadPorId(req.body.idChatActividad);
            if (!chatActividad) {
                return res.status(404).json({message: 'Chat de actividad no encontrado'});
            }
        }

        req.body.idEmisor = idEmisor;
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
    const idEmisor = req.userId;
    //comprueba que el idEmisor es válido
    if (!idEmisor) {
        return res.status(400).json({message: 'ID de emisor inválido'});
    }
    //solo puede actualizar el mensaje el emisor
    const mensaje = await MensajedModel.getMensajePorId(idMensaje);
    if (!mensaje) {
        return res.status(404).json({message: 'Mensaje no encontrado'});
    }
    if (mensaje.idEmisor !== idEmisor) {
        return res.status(403).json({message: 'No tienes permiso para actualizar este mensaje'});
    }
    //solo se puede eliminar el mensaje si no está leído
    if (mensaje.leido) {
        return res.status(400).json({message: 'No se puede eliminar un mensaje ya leído'});
    }


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

//marcar mensaje como leido por id
export const marcarMensajeComoLeidoIndividual = async (req: Request, res: Response) => {
    const idMensaje = Number(req.params.idMensaje);
    const idUsuario = req.userId;


    console.log(" idMensaje: ", idMensaje, " idUsuario: ", idUsuario);


    //existe mensaje
    const mensaje = await MensajedModel.getMensajePorId(idMensaje);
    if (!mensaje) {
        return res.status(404).json({message: 'Mensaje no encontrado'});

    }
    //el usuario es el receptor del mensaje del chat individual
    const chatIndividual = await ChatIndividualModel.getChatIndividualPorId(mensaje.idChatIndividual!);
    if (!chatIndividual) {
        return res.status(404).json({message: 'Chat individual no encontrado'});
    }
    if (idUsuario !== chatIndividual.idUsuario1 && idUsuario !== chatIndividual.idUsuario2) {
        return res.status(403).json({message: 'No tienes permiso para marcar este mensaje como leído'});
    }
    //si soy el emisor no puedo marcarlo como leido
    if (idUsuario === mensaje.idEmisor) {
        return res.status(403).json({message: 'No puedes marcar como leído un mensaje que has enviado'});
    }

    try {
        const mensajeActualizado = await MensajedModel.marcarMensajeLeidoPorChatIndividual(idMensaje);
        res.json(mensajeActualizado);
    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

}


export const deleteMensaje = async (req: Request, res: Response) => {
    const idMensaje = Number(req.params.id);

    //comprueba que el idEmisor es válido
    const idEmisor = req.userId;
    if (!idEmisor) {
        return res.status(400).json({message: 'ID de emisor inválido'});
    }

    //solo puede eliminar el mensaje el emisor
    const mensaje = await MensajedModel.getMensajePorId(idMensaje);
    if (!mensaje) {
        return res.status(404).json({message: 'Mensaje no encontrado'});
    }
    if (mensaje.idEmisor !== idEmisor) {
        return res.status(403).json({message: 'No tienes permiso para eliminar este mensaje'});
    }


    //solo se puede eliminar el mensaje si no está leído
    if (mensaje.leido) {
        return res.status(400).json({message: 'No se puede eliminar un mensaje ya leído'});
    }

    try {
        const exito = await MensajedModel.eliminarMensaje(idMensaje);
        if (!exito) {

            //TODO cuando se borra se actualiza el chart ultimo mensaje | implementar un servicio que busque el mensaje mas reciente por fecha
            return res.status(404).json({message: 'Mensaje no encontrado'});
        }
        res.status(204).json({message: 'Mensaje eliminado correctamente'});
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}