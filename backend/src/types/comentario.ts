export interface Comentario{
    idComentario: number;
    idUsuario: number;
    idRecuerdo: number;
    mensaje: string;
    fechaCreacion: string;
}
export type CrearComentario = Omit<Comentario, 'idComentario' | 'fechaCreacion'>;