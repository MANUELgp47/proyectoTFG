import pool from "../db.js";
import type {ActividadTag, CreaActividadTag} from "../types/actividadTag.js";
import {mapearActividadTag} from "../utils/mappers.js";

export const getAllActividadTags = async (): Promise<ActividadTag[]> => {
    const result = await pool.query("SELECT * FROM actividad_tag");
    return result.rows.map(mapearActividadTag);
};

//obtiene los ActividadTag de una actividad concreta
export const getTagsActividad = async (idActividad: number): Promise<ActividadTag[]> => {
    const result = await pool.query("SELECT * FROM actividad_tag WHERE id_actividad = $1", [idActividad]);
    return result.rows.map(mapearActividadTag);
};

export const crearActividadTag = async (actividadTag: CreaActividadTag): Promise<ActividadTag> => {
    const {
        idActividad,
        idTag,
    } = actividadTag;

    const result = await pool.query(
        `INSERT INTO Actividad_Tag
             (id_actividad, id_tag)
         VALUES ($1, $2) RETURNING *`,
        [idActividad, idTag]
    );

    return mapearActividadTag(result.rows[0]);
};

export const eliminarActividadTag = async (idActividad: number, idTag: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM actividad_tag WHERE id_actividad = $1 AND id_tag = $2", [idActividad, idTag]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};