import pool from "../db.js";
import type {Recuerdo, CrearRecuerdo} from "../types/recuerdo.js";
import {mapearRecuerdo} from "../utils/mappers.js";

export const getAllRecuerdos = async (): Promise<Recuerdo[]> => {
    const result = await pool.query("SELECT * FROM recuerdo");
    return result.rows.map(mapearRecuerdo);
};

export const getRecuerdoPorId = async (idRecuerdo: number): Promise<Recuerdo | null> => {
    const result = await pool.query("SELECT * FROM recuerdo WHERE id_recuerdo = $1", [idRecuerdo]);
    if (result.rows.length === 0) return null;
    return mapearRecuerdo(result.rows[0]);
};

export const getRecuerdosPorUsuario = async (idUsuario: number): Promise<Recuerdo[]> => {
    const result = await pool.query("SELECT * FROM recuerdo WHERE id_usuario = $1", [idUsuario]);
    return result.rows.map(mapearRecuerdo);
};

export const getRecuerdosPorActividad = async (idActividad: number): Promise<Recuerdo[]> => {
    const result = await pool.query("SELECT * FROM recuerdo WHERE id_actividad = $1", [idActividad]);
    return result.rows.map(mapearRecuerdo);
};

export const crearRecuerdo = async (recuerdo: CrearRecuerdo): Promise<Recuerdo> => {
    const {
        idUsuario,
        idActividad,
        titulo,
        descripcion,
        imagenes,
    } = recuerdo;

    const result = await pool.query(
        `INSERT INTO recuerdo
             (id_usuario, id_actividad, titulo, descripcion, imagenes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [idUsuario, idActividad, titulo, descripcion, imagenes]
    );

    return mapearRecuerdo(result.rows[0]);
};

export const eliminarRecuerdo = async (idRecuerdo: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM recuerdo WHERE id_recuerdo = $1", [idRecuerdo]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};

// eliminar recuerdo por idRecuerdo
export const deleteRecuerdoPorId = async (idRecuerdo: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM recuerdo WHERE id_recuerdo = $1", [idRecuerdo]);
    return result.rowCount === 1;
};