import type {Request, Response} from 'express';
import * as RecuerdoModel from '../models/recuerdo.model.js';
import * as NotificacionService from '../services/notificacion.service.js';
import * as ActividadModel from '../models/actividad.model.js';
import * as UsuarioModel from '../models/usuario.model.js';
import {ActividadService} from "../services/actividad.service.js";
import {RecuerdoService} from '../services/recuerdo.service.js';
import {UsuarioService} from "../services/usuario.service.js";
import {AmistadService} from "../services/amistad.service.js";
import type {CrearNotificacion} from "../types/notificacion.js";
import * as NotificacionModel from "../models/notificacion.model.js";

export const getRecuerdos = async (req: Request, res: Response) => {
    try {
        const recuerdos = await RecuerdoModel.getAllRecuerdos();
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdoPorId = async (req: Request, res: Response) => {
    const idRecuerdo = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (undefined === idRecuerdo) {
        return res.status(400).json({message: 'ID inválido'});
    }

    //soy moderador o admin?
    const miRol = await UsuarioService.getRolPorIdUsuario(Number(req.userId));
    let tengoPrivilegios = false;
    if (miRol=== 'admin' || miRol === 'moderador') {
        tengoPrivilegios = true;
    }


    //si el usuario tiene perfil privado, y no soy su amigo, no puedo ver el recuerdo (si el recuerdo es de un usuario con perfil privado)
    const idUsuario = req.userId;
    const idCreadorRecuerdo = await RecuerdoService.getIdCreadorRecuerdo(idRecuerdo);
    if (idCreadorRecuerdo) {
        const esAmigo = await AmistadService.existeAmistad(Number(idUsuario), idCreadorRecuerdo);
        const perfilPublico = await UsuarioService.obtenerPrivacidadPorId(idCreadorRecuerdo);
        if (perfilPublico && !perfilPublico.perfilPublico && !esAmigo && idUsuario !== idCreadorRecuerdo && !tengoPrivilegios) {
            return res.status(403).json({message: 'No tienes permiso para ver este recuerdo'});
        }
    } else {
        return res.status(404).json({message: 'Recuerdo no encontrado'});
    }

    //existe el recuerdo
    const existeRecuerdo = await RecuerdoService.existeRecuerdo(idRecuerdo);
    if (!existeRecuerdo) {
        return res.status(404).json({message: 'Recuerdo no encontrado'});
    }


    try {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        if (!recuerdo) {
            return res.status(404).json({message: 'Recuerdo no encontrado'});
        }
        res.json(recuerdo);
    } catch (error) {
        console.error('Error al obtener recuerdo por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdosPorUsuario = async (req: Request, res: Response) => {

    //tengo permiso?
    const permiso = await AmistadService.tengoPermisoParaVerPerfil(Number(req.userId), Number(req.params.idUsuario));
    if (!permiso) {
        return res.status(403).json({message: 'No tienes permiso para ver los recuerdos de este usuario'});
    }

    const idUsuario = req.params.idUsuario ? parseInt(req.params.idUsuario, 10) : NaN;
    if (undefined === idUsuario) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorUsuario(idUsuario);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const getRecuerdosPorActividad = async (req: Request, res: Response) => {
    const idActividad = req.params.idActividad ? parseInt(req.params.idActividad, 10) : NaN;
    if (undefined === idActividad) {
        return res.status(400).json({message: 'ID inválido'});
    }

    try {
        const recuerdos = await RecuerdoModel.getRecuerdosPorActividad(idActividad);
        res.json(recuerdos);
    } catch (error) {
        console.error('Error al obtener recuerdos por actividad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

export const createRecuerdo = async (req: Request, res: Response) => {

    //campos obligatorios
    const idActividad = req.body.idActividad;
    const idUsuario = req.userId;
    const titulo = req.body.titulo;
    let todoCorrecto = true;

    console.log('idActividad:', idActividad);
    console.log('idUsuario:', idUsuario);
    console.log('titulo:', titulo);

    if (!idActividad || !idUsuario || !titulo) {
        return res.status(400).json({message: 'Faltan campos obligatorios'});
    }

    //validar datos mediante el servicio
    await RecuerdoService.validarDatosRecuerdo(idUsuario, idActividad).then(validacion => {//se usa este formato para poder usar await dentro de la función
        if (!validacion.valido) {
            todoCorrecto = false;
            return res.status(400).json({message: validacion.mensaje});
        }
    });


    //existe idActividad
    /*  const actividadSeleccionada = await ActividadService.getActividadPorId(idActividad);
      if (!actividadSeleccionada || actividadSeleccionada === null) {
          return res.status(400).json({message: 'La actividad no existe'});
      }
      //es participante el usuario que crea el recuerdo
      const esParticipante = await ActividadService.esUsuarioParticipante(idActividad, idUsuario);
      if (!esParticipante) {
          return res.status(403).json({message: 'El usuario no es participante de la actividad'});
      }*/
    //la actividad ha finalizado
    const estado: 'finalizada' = 'finalizada';
    const estadoActividad = await ActividadService.getEstadoActividad(idActividad);
    if (estadoActividad !== estado) {
        todoCorrecto = false;
        return res.status(403).json({message: 'La actividad no ha finalizado'});
    }
    //si el usuario ya ha creado un recuerdo para esa actividad
    const yaTieneRecuerdo = await RecuerdoService.usuarioTieneRecuerdoEnActividad(idUsuario, idActividad);
    if (yaTieneRecuerdo) {
        todoCorrecto = false;
        return res.status(403).json({message: 'El usuario ya ha creado un recuerdo para esta actividad'});
    }

    req.body.idUsuario = req.userId; // Asegura que el recuerdo se asocie al usuario autenticado


    //imagenes
    //Cloudinary
    // 1. Casteamos a 'any' o al tipo específico de Cloudinary para evitar errores de TS
    const nuevosArchivos = (req.files as any[]) || [];

    // 2. Extraemos directamente la URL que nos da Cloudinary
    const rutaImg = nuevosArchivos.map(f => f.path);

    const todasLasImagenes = [...rutaImg];

    req.body.imagenes = todasLasImagenes;

    console.log('Imágenes procesadas para el recuerdo:', todasLasImagenes, 'Archivos originales:', req.files);

    if (todoCorrecto) {
        try {
            const recuerdo = await RecuerdoModel.crearRecuerdo(req.body);
            res.status(201).json(recuerdo);
        } catch (error) {
            console.error('Error al crear recuerdo:', error);
            res.status(500).json({message: 'Error del servidor'});
        }
    }
    //Notifica la creacion del recuerdo a los usuarios participantes de la actividad

    let tipoNot: 'creacion_recuerdo' = 'creacion_recuerdo';
    //get nombre actividad
    const actividad = await ActividadModel.getActividadPorId(req.body.idActividad);
    const nombreActividad = actividad ? actividad.titulo : 'desconocida';
    //nombre usuario que crea el recuerdo
    const usuario = await UsuarioModel.getUsuarioPorId(req.body.idUsuario);
    const nomUsuario = usuario ? usuario.nombreUsuario : 'desconocido';

    //obtener participantes
    const participantes = await ActividadModel.getParticipantesDeActividad(req.body.idActividad);

    participantes.forEach(participante => {

        console.log(`Participante id ${participante}`);

        if (req.body.idUsuario === participante) {// si es el creador del recuerdo
            NotificacionService.NotificacionService.creaNotificacionPorParametros(
                participante,
                tipoNot,
                `Usted ha creado un nuevo recuerdo titulado ${req.body.titulo} de la actividad ${nombreActividad}`,
                req.body.idActividad
            );
        } else {
            NotificacionService.NotificacionService.creaNotificacionPorParametros(
                participante,
                tipoNot,
                `El usuario ${nomUsuario} te ha etiquetado en un recuerdo sobre la actividad ${nombreActividad}`,
                req.body.idActividad
            );
        }

    });


};

export const deleteRecuerdoPorId = async (req: Request, res: Response) => {
    const idUsuario = req.userId;
    if (!idUsuario) {
        return res.status(401).json({message: 'No autorizado'});
    }
    const rol = await UsuarioService.getRolPorIdUsuario(idUsuario);

    const idRecuerdo = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (isNaN(idRecuerdo)) {
        return res.status(400).json({message: 'ID inválido'});
    }

    //comprueba que existe el recuerdo
    const existeRecuerdo = await RecuerdoService.existeRecuerdo(idRecuerdo);
    if (!existeRecuerdo) {
        return res.status(404).json({message: 'Recuerdo no encontrado'});
    }

    //comprobar que el recuerdo pertenece al usuario (esCreador) o que el usuario es admin o mod
    const idCreador = await RecuerdoService.getIdCreadorRecuerdo(idRecuerdo);
    if (idCreador !== idUsuario && (rol !== 'admin' && rol !== 'mod')) {
        return res.status(403).json({message: 'No tienes permiso para eliminar este recuerdo'});
    }

    try {
        const nombreRecuerdo = await RecuerdoService.getTituloRecuerdoPorId(idRecuerdo);
        const deleted = await RecuerdoModel.deleteRecuerdoPorId(idRecuerdo);
        if (deleted) {
            res.json({message: 'Recuerdo eliminado correctamente'});


            if (idCreador !== idUsuario) {


                const notificacionMensaje = `Tu recuerdo ${nombreRecuerdo}, ha sido eliminado por un encargado de la plataforma `;


                const notificacion: CrearNotificacion = {
                    idUsuarioReceptor: Number(idCreador),
                    tipo: 'otro',
                    mensaje: notificacionMensaje,
                    idUsuarioEmisor: idUsuario,
                    idReferencia: idRecuerdo,
                };

                await NotificacionModel.crearNotificacion(notificacion);
            }

        } else {
            res.status(404).json({message: 'Recuerdo no encontrado'});
        }
    } catch (error) {
        console.error('Error al eliminar recuerdo por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};


//TODO: actualizar recuerdo (Pensar primero si dar esa funcionalidad)