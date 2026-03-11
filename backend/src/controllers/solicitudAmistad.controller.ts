import type {Request, Response} from 'express';
import * as SolicitudAmistadModel from '../models/solicitudAmistad.model.js';
import * as NotificacionService from '../services/notificacion.service.js';
import * as UsuarioModel from '../models/usuario.model.js';
import * as AmistadModel from '../models/amistad.model.js';
import * as AmistadService from '../services/amistad.service.js';
import * as UsuarioService from '../services/usuario.service.js';
import * as SolicitudAmistadService from '../services/solicitudAmistad.service.js';

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
    const idReceptor = req.params.idReceptor;
    const idEmisor=req.userId;

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

//no se usa en el frontend, solo para pruebas
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
        const idEmisor = req.userId;
        const idReceptor = Number(req.params.idReceptor);

        //valida que el idEmisor este definido
        if (!idEmisor) {
            return res.status(400).json({message: 'Falta el id del emisor'});
        }

        // Validar que los usuarios existan
        const usuarioEmisorEx = await UsuarioService.UsuarioService.existeUsuarioPorId(idEmisor);
        const usuarioReceptor = await UsuarioService.UsuarioService.existeUsuarioPorId(idReceptor);
        if (!usuarioEmisorEx || !usuarioReceptor) {
            return res.status(404).json({message: 'Uno o ambos usuarios no existen'});
        }

        // Validar que el emisor y receptor no sean el mismo usuario
        if (idEmisor === idReceptor) {
            return res.status(400).json({message: 'No se puede enviar una solicitud de amistad a uno mismo'});
        }
        // Validar que no exista una solicitud de amistad pendiente o aceptada entre los dos usuarios
        const solicitudExistente = await SolicitudAmistadModel.getSolicitudAmistad(idEmisor, idReceptor);
        if (solicitudExistente && solicitudExistente.estado!== 'rechazada') {
            return res.status(400).json({message: 'Ya existe una solicitud de amistad entre estos usuarios'});
        }
        // Validar que no exista ya una amistad entre los dos usuarios
        const amistadExistente = await AmistadService.AmistadService.existeAmistad(idEmisor, idReceptor);
        if (amistadExistente) {
            return res.status(400).json({message: 'Ya existe una amistad entre estos usuarios'});
        }

// Si ya había una solicitud rechazada, se elimina y se crea una nueva
        const estado = await SolicitudAmistadModel.getSolicitudAmistad(idEmisor,idReceptor);
        const rechazado: 'rechazada' = 'rechazada';

        if (estado?.estado == rechazado) {//si ya habia una solicitud rechazada, se elimina y se crea una nueva
            await SolicitudAmistadService.SolicitudAmistadService.eliminarSolicitudAmistad(idEmisor, idReceptor);
        }
        const nuevaSolicitud = await SolicitudAmistadModel.crearSolicitudAmistadPorIds(idEmisor, idReceptor);

        //Obtener nombre de usuario receptor
        const receptor = await UsuarioService.UsuarioService.getNombreUsuarioPorId(idEmisor);
       // const usuarioEmisor = receptor ? receptor : 'Usuario desconocido';//
        //Notifica al receptor de la nueva solicitud de amistad
        await NotificacionService.NotificacionService.creaNotificacionPorParametros(
            idReceptor,
            'solicitud_amistad',
            `Tienes una nueva solicitud de amistad de parte del usuario  ${receptor}`,
            nuevaSolicitud.idEmisor
        );

        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        console.error('Error al crear solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const actualizarEstadoSolicitudAmistad = async (req: Request, res: Response) => {
    const  idActualizador = req.userId;
    const idEmisor = req.params.idUsuarioEmisor;
    const nuevoEstado = req.body.estado;

    console.log("idActualizador: ", idActualizador, " idEmisor: ", idEmisor, " nuevoEstado: ", nuevoEstado);

    //valida que el idEmisor y receptor  este definido
    if (!idEmisor || !idActualizador ) {
        return res.status(400).json({message: 'Falta el id del emisor o receptor'});
    }

    //valida que el nuevo estado sea valido
    if (!['pendiente', 'aceptada', 'rechazada'].includes(nuevoEstado)) {
        return res.status(400).json({message: 'Estado de solicitud de amistad no válido'});
    }

    //comprueba que la solicitud de amistad exista y que el actualizador sea el receptor
    const solicitudExistente = await SolicitudAmistadModel.getSolicitudAmistad(Number(idEmisor), Number(idActualizador));
    if (!solicitudExistente) {
        return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
    }
    if (solicitudExistente.idReceptor !== idActualizador) {
        return res.status(403).json({message: 'No tienes permiso para actualizar esta solicitud de amistad'});
    }



    try {
        const actualizado = await SolicitudAmistadModel.actualizarEstadoSolicitudAmistad(Number(idEmisor), Number(idActualizador), nuevoEstado);
        if (!actualizado) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        let StringAceptada='';
        //crea amistad si la solicitud fue aceptada
        if (nuevoEstado === 'aceptada') {
            // hacer la creacion de amistad en el servicio de amistad
            const respuesta = await AmistadService.AmistadService.crearAmistad(idActualizador, Number(idEmisor));

          //  await AmistadModel.crearAmistad(Number(idEmisor), Number(idActualizador));

            if (!respuesta.valido) {
                console.error('Error al crear amistad tras aceptar solicitud:'+ respuesta.mensaje);
                return res.status(500).json({message: 'Error al crear amistad tras aceptar solicitud'});
            }


            //Notifica al emisor que su solicitud fue aceptada
            const receptor = await UsuarioService.UsuarioService.obtenerUsuarioPorId(idActualizador);
            const usuarioRe =  receptor ? receptor.nombreUsuario : 'Usuario desconocido';

            await NotificacionService.NotificacionService.creaNotificacionPorParametros(
                Number(idEmisor),
                'solicitud_amistad',
                `Tu solicitud de amistad ha sido aceptada por el usuario ${usuarioRe}`,
                Number(idActualizador)
            )

            StringAceptada=' y se ha creado la amistad ';
        }

        res.json({message: 'Estado de la solicitud de amistad actualizado correctamente'+ StringAceptada});
    } catch (error) {
        console.error('Error al actualizar estado de solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
export const eliminarSolicitudAmistad = async (req: Request, res: Response) => {

    const creadorID= req.userId;
    const receptorID= req.params.idUsuarioEmisor;

    try {
        //solo si la petición esta en estado pendiente
        const solicitudExistente = await SolicitudAmistadModel.getSolicitudAmistad(Number(receptorID), Number(creadorID));
        if (!solicitudExistente) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        if (solicitudExistente.estado !== 'pendiente') {
            return res.status(400).json({message: 'Solo se pueden eliminar solicitudes de amistad en estado pendiente'});
        }

        const eliminado = await SolicitudAmistadService.SolicitudAmistadService.eliminarSolicitudAmistad(Number(creadorID), Number(receptorID));
        if (!eliminado) {
            return res.status(404).json({message: 'Solicitud de amistad no encontrada'});
        }
        res.json({message: 'Solicitud de amistad eliminada correctamente'});
    } catch (error) {
        console.error('Error al eliminar solicitud de amistad:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}