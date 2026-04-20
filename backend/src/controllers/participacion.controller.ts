import type {Request, Response} from 'express';
import * as ParticipacionModel from '../models/participacion.model.js';
import {actualizaEstadoParticipacion} from "../models/participacion.model.js";
import * as ActividadModel from '../models/actividad.model.js';
import type {CrearNotificacion} from "../types/notificacion.js";
import * as NotificacionModel from "../models/notificacion.model.js";
import {ActividadService} from "../services/actividad.service.js";
import * as UsuarioService from "../services/usuario.service.js";

export const getParticipaciones = async (req: Request, res: Response) => {
    try {
        const participaciones = await ParticipacionModel.getAllParticipaciones();
        res.json(participaciones);
    } catch (error) {
        console.error('Error al obtener participacions:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getParticipacionPorId = async (req: Request, res: Response) => {
   /* const {idActividad: idActividad} = req.params;
    const idUsuario = req.userId?.toString();*/

    const idActividad = Number(req.params.idActividad) ;//
    const idUsuario = req.userId;

    if (!idUsuario || !idActividad) {
        return res.status(400).json({message: 'idUsuario e idActividad son requeridos'});
    }



    if (Number.isNaN(idUsuario) || Number.isNaN(idActividad)) {
        return res.status(400).json({message: 'IDs inválidos'});
    }

    try {
        const participacion = await ParticipacionModel.getParticipacionPorId(idUsuario, idActividad);
        if (!participacion) {
            return res.status(404).json({message: 'Participacion no encontrada'});
        }
        res.json(participacion);
    } catch (error) {
        console.error('Error al obtener participacion:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getNumeroParticipantesActividad = async (req: Request, res: Response) => {
    const idActividad = req.params.id;

    //comprobar que el usuario que solicita existe
    const idUsuario = req.userId;
    if (idUsuario === undefined) {
        return res.status(400).json({message: 'idUsuario es requerido'});
    } else if (!await UsuarioService.UsuarioService.existeUsuarioPorId(Number(idUsuario))) {
        return res.status(404).json({message: 'El usuario no existe'});
    }

    if (idActividad === undefined) {
        return res.status(400).json({message: 'idUsuario e idActividad son requeridos'});
    }

    try {
        const nparticipaciones = await ParticipacionModel.getNumeroParticipantesPorActividad(parseInt(idActividad, 10));
        res.json(nparticipaciones);
    } catch (error) {
        console.error('Error al obtener participacions por actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
//todas las participaciones de un usuario
export const getParticipacionesPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.userId;

    if (idUsuario === undefined) {
        return res.status(400).json({message: 'idUsuario es requerido'});
    }

    try {
        const participacions = await ParticipacionModel.getParticipacionesPorUsuario(Number(idUsuario));
        res.json(participacions);
    } catch (error) {
        console.error('Error al obtener participacions por usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createParticipacion = async (req: Request, res: Response) => {
    let participacion;
    //comprueba que existe la actividad
    const actividadExiste = await ActividadService.existeActividad(req.body.idActividad);
    if (!actividadExiste) {
        return res.status(404).json({message: 'La actividad no existe'});
    }

    //comprueba que el usuario no es ya participante
    const esParticipante = await ActividadService.esUsuarioParticipante(req.body.idActividad, req.userId!);
    if (esParticipante) {
        return res.status(400).json({message: 'El usuario ya es participante de la actividad'});
    }

    //comprueba que el usuario no está expulsado de la actividad
    const estaExpulsado = await ActividadService.esExpulsadoActividad(req.body.idActividad, req.userId!);
    if (estaExpulsado) {
        return res.status(403).json({message: 'El usuario está expulsado de la actividad'});
    }

    //el usuario no existe
    req.body.idUsuario = req.userId;
    const usuarioExiste = await UsuarioService.UsuarioService.existeUsuarioPorId(req.body.idUsuario);
    if (!usuarioExiste) {
        return res.status(404).json({message: 'El usuario no existe'});
    }

    //si la actividad es publica, la participacion se crea como aceptada=true
    const actividad = await ActividadService.getActividadPorId(req.body.idActividad);
    if (actividad && actividad.publica) {
        //comprobar cupo disponible
        const cupoDisponible = await ActividadService.getCupoDisponible(req.body.idActividad);
        if (cupoDisponible === 0) {
            return res.status(400).json({message: 'La actividad ha alcanzado el máximo de participantes'});
        }

        req.body.aceptada = true;
    } else {
        req.body.aceptada = false;
    }
    try {
        participacion = await ParticipacionModel.crearParticipacion(req.body);
        res.status(201).json(participacion);
    } catch (error) {
        console.error('Error al crear participacion:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

    //notifica la creacion de la participacion al participante. distinguir entre publica y privada
    if (participacion !== undefined) {
        //obtener actividad
        const actividad = await ActividadService.getActividadPorId(participacion.idActividad);
        if (actividad) {
            let aceptada: string;
            let tipoNot: 'solicitud_union_actividad' | 'union_actividad' = 'solicitud_union_actividad';

            if (actividad.publica) {
                tipoNot = 'union_actividad';
                aceptada = 'Usted se ha unido a la actividad ';
            } else {
                aceptada = 'Pendiente de aprobación para unirse a la actividad ';
                //notificar al creador de la actividad que alguien quiere unirse
                //TODO cambiar el mensaje para que muestre el nombre del usuario en lugar del id
                const nombreUsuario = await UsuarioService.UsuarioService.getNombreUsuarioPorId(participacion.idUsuario);
                const notificacionCreador: CrearNotificacion = {
                    idUsuarioReceptor: actividad.idCreador,
                    tipo: 'solicitud_union_actividad',
                    mensaje: `El usuario con ID: ${nombreUsuario} ha solicitado unirse a la actividad ${actividad.titulo}`,
                    idUsuarioEmisor: participacion.idUsuario,
                    idReferencia: participacion.idActividad,
                };
                await NotificacionModel.crearNotificacion(notificacionCreador);
            }
            const notificacion: CrearNotificacion = {
                idUsuarioReceptor: participacion.idUsuario,
                tipo: tipoNot,
                mensaje: `${aceptada} ${actividad.titulo}`,
                idUsuarioEmisor: actividad.idCreador,
                idReferencia: participacion.idActividad,
            };
            await NotificacionModel.crearNotificacion(notificacion);
        }


    }

};

//Actualizar el estado de una participacion (aceptar o rechazar)
export const actualizaEstado = async (req: Request, res: Response) => {
    const {idUsuario, idActividad, aceptada} = req.body;


    const idCreador = await ActividadService.getIdCreadorActividad(idActividad);
    if (aceptada){
        //comprueba que la actividad no ha alcanzado el maximo de participantes y que es el creador quien acepta

        if (idCreador !== req.userId) {
            return res.status(403).json({message: 'Solo el creador de la actividad puede aceptar participaciones'});
        }
        const cupoDisponible = await ActividadService.getCupoDisponible(idActividad);
        if (cupoDisponible === 0) {
            return res.status(400).json({message: 'La actividad ha alcanzado el máximo de participantes'});
        }
    }else{
        //comprobar que quien rechaza es el creador o el propio usuario
        if (idCreador !== req.userId && idUsuario !== req.userId) {
            return res.status(403).json({message: 'Solo el creador de la actividad o el propio usuario pueden rechazar participaciones'});
        }
    }

    try {
        await ParticipacionModel.actualizaEstadoParticipacion(idUsuario, idActividad, aceptada);
        res.status(200).json({message: 'Participacion aceptada'});
    } catch (error) {
        console.error('Error al aceptar participacion:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

    //notificar al usuario que su participacion ha sido aceptada
    if (aceptada) {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        if (actividad) {
            const notificacion: CrearNotificacion = {
                idUsuarioReceptor: idUsuario,
                tipo: 'union_actividad',
                mensaje: `Su solicitud para unirse a la actividad ${actividad.titulo} ha sido aceptada`,
                idUsuarioEmisor: actividad.idCreador,
                idReferencia: idActividad,
            };
            await NotificacionModel.crearNotificacion(notificacion);
        }
    }
};

//obtiene todas las participaciones de una actividad
export const getParticipacionesPorActividad = async (req: Request, res: Response) => {
    const idActividad = req.params.idActividad;

    if (idActividad === undefined) {
        return res.status(400).json({message: 'idActividad es requerido'});
    }
    //comprobar que la actividad existe
    const actividadExiste = await ActividadService.existeActividad(Number(idActividad));
    if (!actividadExiste) {
        return res.status(404).json({message: 'La actividad no existe'});
    }

    try {
        const participacions = await ParticipacionModel.getParticipacionesPorActividad(Number(idActividad));
        res.json(participacions);
    } catch (error) {
        console.error('Error al obtener participacions por actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}


//Eliminar una participacion
export const eliminarParticipacion = async (req: Request, res: Response) => {
    const {idUsuario, idActividad} = req.body;
    const idEditor = req.userId;

   // console.log('eliminar participacion modelo con idUsuario:', idUsuario, 'y idActividad:', idActividad, 'y idEditor:', idEditor);

    //comprobar que la participacion existe
    const participacion = await ParticipacionModel.getParticipacionPorId(Number(idUsuario), Number(idActividad));
    if (!participacion) {
        return res.status(404).json({message: 'Participacion no encontrada'});
    }

    //comprobar que quien elimina es el creador de la actividad o el propio usuario
    const idCreador = await ActividadService.getIdCreadorActividad(Number(idActividad));
    if (idEditor !== idCreador && idEditor !== Number(idUsuario)) {
        return res.status(403).json({message: 'Solo el creador de la actividad o el propio usuario pueden eliminar esta participacion'});
    }

    //comprobar que idUsuario e idActividad son numeros validos y no undefined
    if (idUsuario === undefined || idActividad === undefined) {
        return res.status(400).json({message: 'idUsuario e idActividad son requeridos'});
    }
    if (Number.isNaN(Number(idUsuario)) || Number.isNaN(Number(idActividad))) {
        return res.status(400).json({message: 'IDs inválidos'});
    }

    //si el usuario eliminado es admin le quita el admin a la actividad
    const esAdmin = await ActividadService.esAdminActividad(Number(idActividad), Number(idUsuario));
    if (esAdmin) {
        await ActividadModel.removeAdminActividad(Number(idActividad), Number(idUsuario));
    }

    //si la actividad no está activa, no se pueden eliminar participaciones
    const estadoActividad = await ActividadService.getEstadoActividad(Number(idActividad));
    if (estadoActividad !== 'activa') {
        return res.status(400).json({message: 'No se pueden eliminar participaciones de una actividad que no está activa'});
    }


    //TODO comprobar que el usuario que elimina es el creador de la actividad o el propio usuario

    try {
        await ParticipacionModel.eliminarParticipacion(idUsuario, idActividad);
        res.status(200).json({message: 'Participacion eliminada'});
    } catch (error) {
        console.error('Error al eliminar participacion:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}