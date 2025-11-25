import pool from "../db.js";
import type {ChatActividad, CrearChatActividad} from "../types/chatActividad.js";
import {mapearChatActividad} from "../utils/mappers.js";

export const getAllChatActividads = async (): Promise<ChatActividad[]> => {
    const result = await pool.query("SELECT * FROM chat_actividad");
    return result.rows.map(mapearChatActividad);
};

export const getChatActividadPorId = async (idChatActividad: number): Promise<ChatActividad | null> => {
    const result = await pool.query("SELECT * FROM chat_actividad WHERE id_chat_actividad = $1", [idChatActividad]);
    if (result.rows.length === 0) return null;
    return mapearChatActividad(result.rows[0]);
};
export const crearChatActividad = async (chatActividad: CrearChatActividad): Promise<ChatActividad> => {
    const {
        idActividad,
    } = chatActividad;

    const result = await pool.query(
        `INSERT INTO chat_actividad
             (id_actividad)
         VALUES ($1) RETURNING *`,
        [idActividad]
    );

    return mapearChatActividad(result.rows[0]);
};
export const eliminarChatActividad = async (idChatActividad: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM chat_actividad WHERE id_chat_actividad = $1", [idChatActividad]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};