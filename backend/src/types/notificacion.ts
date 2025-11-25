export interface Notificacion{
    idNotificacion: number;
    idUsuarioReceptor:  number;
    mensaje: string;
    fechaCreacion: string; // timestamp ISO
    tipo: 'solicitud_amistad' | 'chat' | 'union_actividad' | 'creacion_actividad' | 'actualizacion_actividad' | 'posibilidad_recuerdo';
    leida: boolean;
    idReferencia: number;//(id_actividad, id_chat_individual, id_chat_actividad, id_solicitud_amistad)
}
export type CrearNotificacion = Omit<Notificacion, 'idNotificacion' | 'fechaCreacion' | 'leida'>;