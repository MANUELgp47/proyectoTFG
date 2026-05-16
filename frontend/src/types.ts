export interface Usuario {
    idUsuario: number;
    nombreUsuario: string;
    nombre: string;
    apellidos: string;
    descripcion?: string;
    ubicacion?: string;
    biografia?: string;
    fechaRegistro: string;
    verificado: boolean;
    ultimaConexion?: string;
    imagen?: string;
}

export interface Amistad {
    idUsuario1: number;
    idUsuario2: number;
    fechaAmistad?: string;
}

export interface SolicitudAmistad {
    idEmisor: number;
    idReceptor: number;
    fechaEnvio: string;
    estado: 'pendiente' | 'aceptada' | 'rechazada';
}

export interface Mensaje {
    idMensaje: number;
    idChatIndividual?: number;
    idChatActividad?: number;
    idEmisor: number;
    contenido: string;
    fechaEnvio: string; // timestamp ISO
    leido: boolean;
}

export interface UsuarioMinimo {
    idUsuario: number;
    nombreUsuario: string;
    imagen?: string[] | string;
}

export interface ActividadMinima {
    idActividad: number;
    titulo: string;
    imagen?: string;
}

export interface ChatIndividual {

    idChatIndividual: number;
    idUsuario1: number;
    idUsuario2: number;
    fechaCreacion: string; // timestamp ISO
    ultimoMensaje?: number; // id del mensaje

};

export interface Tag {
    idTag: number;
    nombre: string;
    imagen?: string;
}

export interface ChatActividad {
    idChatActividad: number;
    idActividad: number;
    fechaCreacion: string; // timestamp ISO
    ultimoMensaje?: number;
}

export interface Actividad {
    idActividad: number;
    idCreador: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion: string | Date; // timestamp ISO
    fechaInicio: string | Date;  // timestamp ISO
    fechaFin: string | Date;     // timestamp ISO
    ubicacion?: string;
    publica: boolean;
    participantesmax?: number;
    imagenes?: string[];
    admins?: number[]; // IDs de usuarios con permisos de administración
    expulsados?: number[]; // IDs de usuarios expulsados
    estado: 'activa' | 'finalizada' | 'cancelada';
}

/*
export interface Actividad {
    idActividad: number;
    titulo: string;
    idCreador: number;
    descripcion?: string;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    ubicacion?: string;
    imagenes?: string[];
    publica?: boolean;
    participantesmax?: number;
    estado: 'activa' | 'finalizada' | 'cancelada';
}*/

export interface Recuerdo {
    idRecuerdo: number;
    idUsuario: number;
    idActividad?: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion?: string; // timestamp ISO
    imagenes?: string[];
}

export interface Comentario {
    idComentario: number;
    idUsuario: number;
    idRecuerdo: number;
    mensaje: string;
    fechaCreacion: string;
}

export interface Settings {
    idUsuario: number;
    perfilPublico: boolean;
    actividadPublica: boolean;
    modoOscuro: boolean;
    idioma: string; // e.g., 'es', 'en', etc.
    preferencias: number[]; // Array de IDs de preferencias
    usuariosBloqueados: number[]; // Array de IDs de usuarios bloqueados
}

export interface Notificacion {
    idNotificacion: number;
    idUsuarioReceptor: number;
    mensaje: string;
    fechaCreacion: string; // timestamp ISO
    tipo: 'solicitud_amistad' | 'chat_individual_lleno' | 'chat_individual' | 'chat_actividad_lleno' | 'chat_actividad' | 'union_actividad' | 'creacion_actividad' | 'actualizacion_actividad' | 'solicitud_union_actividad' | 'posibilidad_recuerdo' | 'creacion_recuerdo' | 'denuncia_comentario' | 'denuncia_usuario' | 'denuncia_recuerdo' | 'denuncia_actividad'| 'otro';
    leida: boolean;
    idUsuarioEmisor: number; // Opcional, solo para ciertos tipos de notificaciones
    idReferencia: number;//(id_actividad, id_chat_individual, id_chat_actividad, id_solicitud_amistad)
}