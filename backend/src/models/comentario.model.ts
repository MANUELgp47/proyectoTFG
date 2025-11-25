import pool from "../db.js";
import type {Comentario, CrearComentario} from "../types/comentario.js";
import {mapearComentario} from "../utils/mappers.js";

export const getAllComentarios = async (): Promise<Comentario[]> => {
    const result = await pool.query("SELECT * FROM comentario");
    return result.rows.map(mapearComentario);
};

export const getComentarioPorId = async (idComentario: number): Promise<Comentario | null> => {
    const result = await pool.query("SELECT * FROM comentario WHERE id_comentario = $1", [idComentario]);
    if (result.rows.length === 0) return null;
    return mapearComentario(result.rows[0]);
};

//todos los cometarios de un recuerdo
export const getComentariosPorRecuerdo = async (idRecuerdo: number): Promise<Comentario[]> => {
    const result = await pool.query("SELECT * FROM comentario WHERE id_recuerdo = $1", [idRecuerdo]);
    return result.rows.map(mapearComentario);
}

//todos los comentarios de un usuario
export const getComentariosPorUsuario = async (idUsuario: number): Promise<Comentario[]> => {
    const result = await pool.query("SELECT * FROM comentario WHERE id_usuario = $1", [idUsuario]);
    return result.rows.map(mapearComentario);
};


export const crearComentario = async (comentario: CrearComentario): Promise<Comentario> => {
    const {
        idUsuario,
        idRecuerdo,
        mensaje,
    } = comentario;

    const result = await pool.query(
        `INSERT INTO comentario
             (id_usuario, id_recuerdo, mensaje)
         VALUES ($1, $2, $3) RETURNING *`,
        [idUsuario, idRecuerdo, mensaje]
    );

    return mapearComentario(result.rows[0]);
};

export const eliminarComentario = async (idComentario: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM comentario WHERE id_comentario = $1", [idComentario]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};
