import pool from "../db.js";
import type {Tag, CrearTag} from "../types/tag.js";
import {mapearTag} from "../utils/mappers.js";

export const getAllTags = async (): Promise<Tag[]> => {
    const result = await pool.query("SELECT * FROM tag");
    return result.rows.map(mapearTag);
};

export const getTagPorId = async (idTag: number): Promise<Tag | null> => {
    const result = await pool.query("SELECT * FROM tag WHERE id_tag = $1", [idTag]);
    if (result.rows.length === 0) return null;
    return mapearTag(result.rows[0]);
};
//todos los tags de una actividad
export const getTagsPorActividad = async (idActividad: number): Promise<Tag[]> => {
    const result = await pool.query(
        `SELECT t.*
         FROM tag t
                  JOIN actividad_tag at
         ON t.id_tag = at.id_tag
         WHERE at.id_actividad = $1`,
        [idActividad]
    );
    return result.rows.map(mapearTag);;
};

//get tag por nombre
export const getTagPorNombre = async (nombre: string): Promise<Tag | null> => {
    const result = await pool.query("SELECT * FROM tag WHERE nombre = $1", [nombre]);
    if (result.rows.length === 0) return null;
    return mapearTag(result.rows[0]);
};

//crea un nuevo tag
export const crearTag = async (tag: CrearTag): Promise<Tag> => {
    const {nombre, imagen} = tag;

    const result = await pool.query(
        `INSERT INTO tag (nombre, imagen) VALUES ($1, $2) RETURNING *`,
        [nombre, imagen]
    );

    return mapearTag(result.rows[0]);
};

//elimina
export const eliminarTag = async (idTag: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM tag WHERE id_tag = $1", [idTag]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};