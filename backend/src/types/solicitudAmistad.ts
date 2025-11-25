export interface SolicitudAmistad{
    idEmisor: number;
    idReceptor: number;
    fechaEnvio: string; // timestamp ISO
    estado: 'pendiente' | 'aceptada' | 'rechazada';
}
export type CrearSolicitudAmistad = Omit<SolicitudAmistad, 'fechaEnvio' | 'estado'>;