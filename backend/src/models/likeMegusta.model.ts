import pool from "../db.js";
import type {LikeMegusta, CrearLikeMegusta} from "../types/likeMegusta.js";
import {mapearLikeMegusta} from "../utils/mappers.js";

export const getAllLikeMegusta = async (): Promise<LikeMegusta[]> => {
    const result = await pool.query("SELECT * FROM like_megusta");
    return result.rows.map(mapearLikeMegusta);
};
export const getLikeMegustaPorId = async (idLike: number): Promise<LikeMegusta | null> => {
    const result = await pool.query("SELECT * FROM like_megusta WHERE id_like = $1", [idLike]);
    if (result.rows.length === 0) return null;
    return mapearLikeMegusta(result.rows[0]);
};

export const getLikesMegustaPorIdRecuerdo = async (idRecuerdo: number): Promise<LikeMegusta[]> => {
    const result = await pool.query(
        "SELECT * FROM like_megusta WHERE id_recuerdo = $1",
        [idRecuerdo]
    );
    return result.rows.map(mapearLikeMegusta);
};
export const getLikesMegustaPorIdComentario = async (idComentario: number): Promise<LikeMegusta[]> => {
    const result = await pool.query(
        "SELECT * FROM like_megusta WHERE id_comentario = $1",
        [idComentario]
    );
    return result.rows.map(mapearLikeMegusta);
};

export const getNumeroLikesRecuerdo = async (idRecuerdo: number): Promise<number> => {
    const result = await pool.query(
        "SELECT COUNT(*) FROM like_megusta WHERE id_recuerdo = $1",
        [idRecuerdo]
    );
    return parseInt(result.rows[0].count, 10);
};

export const getNumeroLikesComentario = async (idComentario: number): Promise<number> => {
    const result = await pool.query(
        "SELECT COUNT(*) FROM like_megusta WHERE id_comentario = $1",
        [idComentario]
    );
    return parseInt(result.rows[0].count, 10);
};

export const crearLikeMegusta = async (likeMegusta: CrearLikeMegusta): Promise<LikeMegusta> => {
    const {
        idUsuario,
        idComentario,
        idRecuerdo,
    } = likeMegusta;

    const result = await pool.query(
        `INSERT INTO like_megusta
             (id_usuario, id_comentario, id_recuerdo)
         VALUES ($1, $2, $3) RETURNING *`,
        [idUsuario, idComentario, idRecuerdo]
    );

    return mapearLikeMegusta(result.rows[0]);
};

export const eliminarLikeMegusta = async (idLike: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM like_megusta WHERE id_like = $1", [idLike]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};
