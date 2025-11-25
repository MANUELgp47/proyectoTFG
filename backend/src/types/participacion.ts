export interface Participacion {
    idUsuario: number;
    idActividad: number;
    fechaCreacion: string; // timestamp ISO
    aceptada: boolean;
    esCreador: boolean;
}
export type Crearparticipacion = Omit<Participacion, 'fechaCreacion'  >;