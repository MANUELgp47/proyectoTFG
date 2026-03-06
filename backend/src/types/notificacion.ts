export interface Notificacion{
    idNotificacion: number;
    idUsuarioReceptor:  number;
    mensaje: string;
    fechaCreacion: string; // timestamp ISO
    tipo: 'solicitud_amistad' | 'chat_individual_lleno' | 'chat_individual' |'chat_actividad_lleno' | 'chat_actividad' |'union_actividad' | 'creacion_actividad' | 'actualizacion_actividad' | 'solicitud_union_actividad' | 'posibilidad_recuerdo' | 'creacion_recuerdo';
    leida: boolean;
    idUsuarioEmisor: number; // Opcional, solo para ciertos tipos de notificaciones
    idReferencia: number;//(id_actividad, id_chat_individual, id_chat_actividad, id_solicitud_amistad)
}
export type CrearNotificacion = Omit<Notificacion, 'idNotificacion' | 'fechaCreacion' | 'leida'>;