export interface ChatIndividual{

    idChatIndividual: number;
    idUsuario1: number;
    idUsuario2: number;
    fechaCreacion: string; // timestamp ISO
    ultimoMensaje?: number; // id del mensaje

};
export type CrearChatIndividual = Omit<ChatIndividual, 'idChatIndividual' | 'fechaCreacion' | 'ultimoMensaje'>;