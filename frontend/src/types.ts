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