//Sirve para mapear datos entre diferentes formatos o estructuras en la aplicación backend.

import {type Usuario } from "../types/usuario.js";//se usa .js porque es un módulo de Node.js
import {type Actividad } from "../types/actividad.js";
import type {ChatActividad} from "../types/chatActividad.js";

// Mapea los campos snake_case (BD) a camelCase (TypeScript)
export const mapearUsuario = (row: any): Usuario => {
    return {
        idUsuario: row.id_usuario,
        nombreUsuario: row.nombre_usuario,
        nombre: row.nombre,
        apellidos: row.apellidos,
        email: row.email,
        contrasena: row.contraseña,
        fechaNac: row.fecha_nac,
        sexo: row.sexo,
        fotoPerfil: row.foto_perfil,
        biografia: row.biografia,
        fechaRegistro: row.fecha_registro,
        ultimaConexion: row.ultima_conexion,
        ubicacion: row.ubicacion,
    };
};

export const mapearActividad = (row: any): Actividad => {
    return {
        idActividad: row.id_actividad,
        idCreador: row.id_creador,
        titulo: row.titulo,
        descripcion: row.descripcion,
        fechaCreacion: row.fecha_creacion,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        ubicacion: row.ubicacion,
        publica: row.publica,
        participantesmax: row.participantes_max,
        imagenes: row.imagenes,
        estado: row.estado,
    };
};

export const mapearAmistad = (row: any) => {
    return {
        idUsuario1: row.id_usuario_1,
        idUsuario2: row.id_usuario_2,
        fechaAmistad: row.fecha_amistad,
        estado: row.estado,
    };
}

export const mapearActividadTag = (row: any) => {
    return {
        idActividad: row.id_actividad,
        idTag: row.id_tag,
    };
}
export const mapearChatActividad = (row: any): ChatActividad => {
    return {
        idChatActividad: row.id_chat_actividad,
        idActividad: row.id_actividad,
        fechaCreacion: row.fecha_creacion,
        ultimoMensaje: row.ultimo_mensaje,
    };
}
export const mapearChatIndividual = (row: any) => {
    return {
        idChatIndividual: row.id_chat_individual,
        idUsuario1: row.id_usuario1,
        idUsuario2: row.id_usuario2,
        fechaCreacion: row.fecha_creacion,
        ultimoMensaje: row.ultimo_mensaje,
    };
}

export const mapearComentario = (row: any) => {
    return {
        idComentario: row.id_comentario,
        idUsuario: row.id_usuario,
        idRecuerdo: row.id_recuerdo,
        mensaje: row.mensaje,
        fechaCreacion: row.fecha_creacion,
    };
};
export const mapearLikeMegusta = (row: any) => {
    return {
        idLike: row.id_like,
        idUsuario: row.id_usuario,
        idComentario: row.id_comentario,
        idRecuerdo: row.id_recuerdo,
        fechaCreacion: row.fecha_creacion,
    };
};

export const mapearMensaje = (row: any) => {
    return {
        idMensaje: row.id_mensaje,
        idChatIndividual: row.id_chat_individual,
        idChatActividad: row.id_chat_actividad,
        idEmisor: row.id_emisor,
        contenido: row.contenido,
        fechaEnvio: row.fecha_envio,
        leido: row.leido,
    };
};
export const mapearNotificacion = (row: any) => {
    return {
        idNotificacion: row.id_notificacion,
        idUsuarioReceptor: row.id_usuario_receptor,
        tipo: row.tipo,
        mensaje: row.mensaje,
        fechaCreacion: row.fecha_creacion,
        leida: row.leida,
        idReferencia: row.id_referencia,
    };
};
export const mapearParticipacion = (row: any) => {
    return {
        idUsuario: row.id_usuario,
        idActividad: row.id_actividad,
        fechaCreacion: row.fecha_creacion,
        aceptada: row.aceptada,
        esCreador: row.es_creador,
    };
};

export const mapearRecuerdo = (row: any) => {
    return {
        idRecuerdo: row.id_recuerdo,
        idUsuario: row.id_usuario,
        idActividad: row.id_actividad,
        titulo: row.titulo,
        descripcion: row.descripcion,
        fechaCreacion: row.fecha_creacion,
        imagenes: row.imagenes,
    };
};
export const mapearSolicitudAmistad = (row: any) => {
    return {
        idEmisor: row.id_emisor,
        idReceptor: row.id_receptor,
        fechaEnvio: row.fecha_envio,
        estado: row.estado,
    };
};
export const mapearTag = (row: any) => {
    return {
        idTag: row.id_tag,
        nombre: row.nombre,
    };
};