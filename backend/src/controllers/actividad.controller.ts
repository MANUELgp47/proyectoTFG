import type {Request, Response} from 'express';
import * as ActividadModel from '../models/actividad.model.js';
import * as NotificacionModel from '../models/notificacion.model.js';
import type {CrearNotificacion} from "../types/notificacion.js";
import * as ParticipacionModel from '../models/participacion.model.js';
//importa actividad.job.ts para usar la función de finalizar actividad
import * as ActividadJob from '../jobs/actividad.job.js';
import * as ChatActividadModel from '../models/chatActividad.model.js';
import * as ActividadService from '../services/actividad.service.js';
import {UsuarioService} from "../services/usuario.service.js";


export const getActividades = async (req: Request, res: Response) => {
    try {
        const actividads = await ActividadModel.getAllActividads();
        res.json(actividads);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//get actividad por id
export const getActividadPorId = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idActividad = Number.parseInt(idParam, 10);
        if (Number.isNaN(idActividad)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        //existe el usuario
        const usuarioExiste = await UsuarioService.existeUsuarioPorId(Number(req.userId));
        if (!usuarioExiste) {
            return res.status(400).json({message: 'Usuario no encontrado'});
        }

        //existe la actividad
        const existeActividad = await ActividadService.ActividadService.existeActividad(idActividad);
        if (!existeActividad) {
            return res.status(404).json({message: 'Actividad no encontrada'});
        }

        const actividad = await ActividadService.ActividadService.getActividadPorId(idActividad);
        if (actividad) {
            res.json(actividad);
        } else {
            res.status(404).json({message: 'Actividad no encontrada'});
        }
    }
    catch (error) {
        console.error('Error al obtener actividad por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};


//get actividades por id de usuario (las actividades que ha creado un usuario)
    export const getActividadesPorUsuario = async (req: Request, res: Response) => {
        try {
            //comprueba que el usuario que hace la petición exsiste

            const idSolicitante = req.userId;

            if (!idSolicitante) {


                return res.status(400).json({message: 'ID de usuario solicitane requerido'});
            }


            if (!await UsuarioService.existeUsuarioPorId(Number(idSolicitante))) {
                return res.status(400).json({message: 'Usuario solicitane no encontrado'});
            }


            //comprueba que el id de usuario en los parametros es un numero y existe

            const idUsuario = req.params.idUsuario;


            if (!idUsuario) {

                return res.status(400).json({message: 'ID de usuario requerido ' + idUsuario});
            }

            //idUsuario es un usuario existente
            if (!await UsuarioService.existeUsuarioPorId(Number(idUsuario))) {
                return res.status(400).json({message: 'Usuario no encontrado' + Number(idUsuario)});
            }


            //TODO si queremos podemos poner que solo lo vea si son amigos. Y pasar como parametro el nombre y no el id


            const actividades = await ActividadService.ActividadService.getActividadesDeUsuario(Number(idUsuario));
            res.json(actividades);
        } catch (error) {
            console.error('Error al obtener actividades por usuario:', error);
            res.status(500).json({message: 'Error del servidor'});
        }
    }

    export const createActividad = async (req: Request, res: Response) => {
        let actividad;
        try {
            console.log("Valor de req.userId en createActividad:", req.userId);
            req.body.idCreador = req.userId;//asigna el id del usuario logueado como creador de la actividad
            if (!req.body.idCreador) {
                return res.status(400).json({message: 'ID del creador es requerido'});
            }
            actividad = await ActividadModel.crearActividad(req.body);
            res.status(201).json(actividad);
        } catch (error) {
            console.error('Error al crear actividad:', error);
            res.status(500).json({message: 'Error del servidor'});

        }
        //Crea participacion del creador de la actividad
        if (actividad !== undefined) {
            try {
                await ParticipacionModel.crearParticipacion({
                    idUsuario: actividad.idCreador,
                    idActividad: actividad.idActividad,
                    esCreador: true,
                    aceptada: true,
                });
            } catch (error) {
                console.error('Error al crear participacion del creador de la actividad:', error);
            }
        }

        //crea el chat de la actividad

        if (actividad !== undefined) {
            try {
                await ChatActividadModel.crearChatActividad({idActividad: actividad.idActividad});
            } catch (error) {
                console.error('Error al crear chat de la actividad:', error);
            }
        }

        // NOTIFICACION DE CREACION DE ACTIVIDAD
        if (actividad !== undefined) {
            const notificacion: CrearNotificacion = {
                idUsuarioReceptor: actividad.idCreador,
                tipo: 'creacion_actividad',
                mensaje: `Se ha creado la actividad con nombre ${req.body.titulo}`,
                idReferencia: actividad.idActividad, //id de la actividad creada actividad.idActividad
            };

            NotificacionModel.crearNotificacion(notificacion);
        } else {
            console.error('No se pudo crear la notificación porque la actividad es undefined');
        }


    };

//actualizar actividad
//establecer campos no actualizables
    export const updateActividad = async (req: Request, res: Response) => {
        let idActividad;
        try {
            //si no es la sesión del creador no puede actualizar ciertos campos

            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({message: 'ID requerido'});
            }
            idActividad = Number.parseInt(idParam, 10);
            if (Number.isNaN(idActividad)) {
                return res.status(400).json({message: 'ID inválido'});
            }

            const esCreador: boolean = await ActividadService.ActividadService.esCreadorActividad(idActividad, req.userId!);
            if (esCreador == false) {
                return res.status(400).json({menssage: 'No eres el creador de la actividad'});
            }

            /* const actividadVieja = await ActividadService.ActividadService.getIdCreadorActividad(idActividad);
             if (actividadVieja !== req.userId) {
                 //el usuario no es el creador de la actividad
                 return res.status(400).json({menssage: 'No eres el creador de la actividad'});
             }*/

            const estadoActividad = await ActividadService.ActividadService.getEstadoActividad(idActividad);
            if (estadoActividad === 'finalizada') {
                return res.status(400).json({message: 'No se puede actualizar una actividad finalizada'});
            }

            const actividadActualizado = await ActividadModel.actualizarActividad(idActividad, req.body);
            if (actividadActualizado) {
                res.json(actividadActualizado);
            } else {
                res.status(404).json({message: 'Actividad no encontrado'});
            }
        } catch (error) {
            console.error('Error al actualizar Actividad:', error);
            res.status(500).json({message: 'Error del servidor'});
        }

        let actividadActualizada;
        if (idActividad !== undefined) {
            actividadActualizada = await ActividadModel.getActividadPorId(idActividad);
        }

        // NOTIFICACION DE ACTUALIZACION DE ACTIVIDAD
        if (actividadActualizada !== undefined) {
            const actividad = await actividadActualizada;//espera a que se resuelva la petición
            if (actividad) {
                const notificacion: CrearNotificacion = {
                    idUsuarioReceptor: actividad.idCreador,
                    tipo: 'actualizacion_actividad',
                    mensaje: `Se ha actualizado la actividad con nombre ${actividad.titulo}`,
                    idReferencia: actividad.idActividad,
                };

                NotificacionModel.crearNotificacion(notificacion);
            } else {
                console.error('No se pudo crear la notificación porque la actividad es null');
            }
        } else {
            console.error('No se pudo crear la notificación porque la actividad es undefined');
        }

    };


//finalizar actividad cons actividad.job.ts
    export const finalizarActividad = async (req: Request, res: Response) => {
        console.log("actividad a finalizar:", req.params.id);
        try {
            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({message: 'ID requerido'});
            }

            const idActividad = Number.parseInt(idParam, 10);
            const miActividad = await ActividadModel.getActividadPorId(idActividad)
            if (Number.isNaN(idActividad)) {
                return res.status(400).json({message: 'ID inválido'});
            }

            // Verificar si la actividad es activa y si la fecha de fin es mayor a la fecha actual para evitar finalizar actividades ya finalizadas
            if (
                miActividad?.estado !== 'activa' ||
                (miActividad.fechaFin && new Date(miActividad.fechaFin) < new Date())//si ya ha pasado la fecha fin
            ) {
                console.error('La actividad ya ha sido finalizada previamente');
                return res.status(400).json({message: 'La actividad no puede ser finalizada'});
            }

            const esCreador: boolean = await ActividadService.ActividadService.esCreadorActividad(idActividad, req.userId!);
            if (esCreador == false) {
                return res.status(400).json({menssage: 'No eres el creador de la actividad'});
            }


            //todo: Se puede seguir usando el chat?
            const finalizada = await ActividadJob.finalizarActividadesCaducadas([idActividad]);
            if (finalizada) {
                res.json({message: 'Actividad finalizada correctamente'});
            } else {
                res.status(404).json({message: 'Actividad no encontrada o no finalizada'});
            }


        } catch (error) {
            console.error('Error al finalizar Actividad:', error);
            res.status(500).json({message: 'Error del servidor'});
        }
    };


//Eliminar actividad
    export const deleteActividad = async (req: Request, res: Response) => {
        let actividad_eliminar;
        let eliminado;

        try {
            if (req.params.id !== undefined) {//parte para notificación
                actividad_eliminar = await ActividadModel.getActividadPorId(parseInt(req.params.id, 10));
            }

            const idParam = req.params.id;
            if (!idParam) {// si no hay id en los parametros
                return res.status(400).json({message: 'ID requerido'});
            }
            const idActividad = Number.parseInt(idParam, 10);//10 para indicar que es base decimal
            if (Number.isNaN(idActividad)) {
                return res.status(400).json({message: 'ID inválido'});
            }

            //si la actividad está finalizada no se puede eliminar TODO ver si es necesario
            const estadoActividad = await ActividadService.ActividadService.getEstadoActividad(idActividad);
            if (estadoActividad === 'finalizada') {
                return res.status(400).json({message: 'No se puede eliminar una actividad finalizada'});
            }

            //si no es la sesión del creador no puede eliminar la actividad
            const esCreador: boolean = await ActividadService.ActividadService.esCreadorActividad(idActividad, req.userId!);
            if (esCreador == false) {
                return res.status(400).json({menssage: 'No eres el creador de la actividad'});
            }


            eliminado = await ActividadModel.eliminarActividad(idActividad);
            if (eliminado) {// si se elimino correctamente
                res.json({message: 'Actividad eliminada correctamente'});
            } else {
                res.status(404).json({message: 'Actividad no encontrada'});
            }
        } catch (error) {
            console.error('Error al eliminar Actividad:', error);
            res.status(500).json({message: 'Error del servidor'});
        }

        //TODO:
        //Ver si es nesesario poner notificación de eliminación de actividad

        // NOTIFICACION DE ELIMINACION DE ACTIVIDAD
        /*if (eliminado){if (actividad_eliminar !== undefined) {
            const actividad = await actividad_eliminar;//espera a que se resuelva la petición
            if (actividad) {
                const notificacion: CrearNotificacion = {
                    idUsuarioReceptor: actividad.idCreador,
                    tipo: 'actualizacion_actividad',
                    mensaje: `Se ha actualizado la actividad con nombre ${actividad.titulo}`,
                    idReferencia: actividad.idActividad,
                };

                NotificacionModel.crearNotificacion(notificacion);
            } else {
                console.error('No se pudo crear la notificación porque la actividad es null');
            }
        } else {
            console.error('No se pudo crear la notificación porque la actividad es undefined');
        }}
    */
    };

//get actividades en las que participa un usuario
    export const getActividadesQueParticipo = async (req: Request, res: Response) => {
        try {
            const idUsuario = req.userId;
            if (!idUsuario) {
                return res.status(400).json({message: 'ID de usuario requerido'});
            }

            const actividades = await ActividadService.ActividadService.getActividadesQueParticipo(Number(idUsuario));
            res.json(actividades);
        } catch (error) {
            console.error('Error al obtener actividades en las que participa el usuario:', error);
            res.status(500).json({message: 'Error del servidor'});
        }
    }