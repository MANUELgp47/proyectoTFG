export interface Actividad {
    idActividad: number;
    idCreador: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion: string; // timestamp ISO
    fechaInicio?: string;  // timestamp ISO
    fechaFin?: string;     // timestamp ISO
    ubicacion?: string;
    publica: boolean;
    participantesmax?: number;
    imagenes?: string[];
    estado: 'activa' | 'finalizada' | 'cancelada';
    //TODO añadir un campo de notificado boolean para evitar dupolicar notificaciones

}
export type CreaActividad = Omit<Actividad, 'idActividad' | 'fechaCreacion' | 'estado'>;