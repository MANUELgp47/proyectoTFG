import pool from "../db.js";
import type {Amistad, CrearAmistad} from "../types/amistad.js";
import {mapearAmistad} from "../utils/mappers.js";

export const getAllAmistad = async (): Promise<Amistad[]> => {
    const result = await pool.query("SELECT * FROM amistad");
    return result.rows.map(mapearAmistad);
};

export const getAmistadPorUsuarios = async (idUsuario1: number, idUsuario2: number): Promise<Amistad | null> => {
    const result = await pool.query("SELECT * FROM amistad WHERE id_usuario1 = $1 AND id_usuario2 = $2", [idUsuario1, idUsuario2]);
    if (result.rows.length === 0) return null;
    return mapearAmistad(result.rows[0]);
};

//todas las amistades de un usuario
export const getAmistadesPorUsuario = async (idUsuario: number): Promise<Amistad[]> => {
    const result = await pool.query("SELECT * FROM amistad WHERE id_usuario1 = $1 OR id_usuario2 = $1", [idUsuario]);
    return result.rows.map(mapearAmistad);
};

export const crearAmistad = async (idUsuario1: number, idUsuario2: number): Promise<Amistad> => {
    const result = await pool.query(
        `INSERT INTO amistad
             (id_usuario1, id_usuario2)
         VALUES ($1, $2) RETURNING *`,
        [idUsuario1, idUsuario2]
    );

    return mapearAmistad(result.rows[0]);
};

export const eliminarAmistad = async (idUsuario1: number, idUsuario2: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM amistad WHERE id_usuario1 = $1 AND id_usuario2 = $2", [idUsuario1, idUsuario2]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};