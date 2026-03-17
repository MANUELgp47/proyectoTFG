export interface Usuario {
    idUsuario: number;
    nombreUsuario: string;
    nombre: string;
    apellidos: string;
    descripcion?: string;
    ubicacion?: string;
    biografia?: string;
    fechaRegistro: string;
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

export interface ChatIndividual{

    idChatIndividual: number;
    idUsuario1: number;
    idUsuario2: number;
    fechaCreacion: string; // timestamp ISO
    ultimoMensaje?: number; // id del mensaje

};

export interface Tag {
    idTag: number;
    nombre: string;
}

export interface ChatActividad {
    idChatActividad: number;
    idActividad:  number;
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