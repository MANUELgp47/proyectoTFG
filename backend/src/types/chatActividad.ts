export interface ChatActividad{
    idChatActividad: number;
    idActividad:  number;
    fechaCreacion: string; // timestamp ISO
    ultimoMensaje?: number;
}

export type CrearChatActividad = Omit<ChatActividad, 'idChatActividad' | 'fechaCreacion' | 'ultimoMensaje'>;//idChatActividad y fechaCreacion se generan automáticamente al crear el chat
