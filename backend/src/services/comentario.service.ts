import * as ComentarioModel from '../models/comentario.model.js';

export class ComentarioService {
    static async existeComentario(idComentario: number): Promise<boolean> {
        const comentario = await ComentarioModel.getComentarioPorId(idComentario);
        return comentario !== null;
    };
}