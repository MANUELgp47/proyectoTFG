export interface Mensaje {
    idMensaje: number;
    idChatIndividual?: number;
    idChatActividad?: number;
    idEmisor: number;
    contenido: string;
    fechaEnvio: string; // timestamp ISO
    leido: boolean;
}
export type CrearMensaje = Omit<Mensaje, 'idMensaje' | 'fechaEnvio' | 'leido'>;