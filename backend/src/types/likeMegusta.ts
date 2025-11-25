export interface LikeMegusta{
    idLike: number;
    idUsuario: number;
    idComentario?: number;
    idRecuerdo?: number;
    fechaCreacion: string;
}
export type CrearLikeMegusta = Omit<LikeMegusta, 'idLike' | 'fechaCreacion'>;