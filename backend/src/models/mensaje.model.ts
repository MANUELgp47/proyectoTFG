import pool from "../db.js";
import type {Mensaje, CrearMensaje} from "../types/mensaje.js";
import {mapearMensaje} from "../utils/mappers.js";

export const getAllMensajes = async (): Promise<Mensaje[]> => {
    const result = await pool.query("SELECT * FROM mensaje");
    return result.rows.map(mapearMensaje);
};
export const getMensajePorId = async (idMensaje: number): Promise<Mensaje | null> => {
    const result = await pool.query("SELECT * FROM mensaje WHERE id_mensaje = $1", [idMensaje]);
    if (result.rows.length === 0) return null;
    return mapearMensaje(result.rows[0]);
};

export const getMensajesPorChatIndividual = async (idChatIndividual: number): Promise<Mensaje[]> => {
    const result = await pool.query("SELECT * FROM mensaje WHERE id_chat_individual = $1 ORDER BY fecha_envio ASC", [idChatIndividual]);
    return result.rows.map(mapearMensaje);
};
export const getMensajesPorChatActividad = async (idChatActividad: number): Promise<Mensaje[]> => {
    const result = await pool.query("SELECT * FROM mensaje WHERE id_chat_actividad = $1 ORDER BY fecha_envio ASC", [idChatActividad]);
    return result.rows.map(mapearMensaje);
};

export const crearMensaje = async (mensaje: CrearMensaje): Promise<Mensaje> => {
    const {
        idChatIndividual,
        idChatActividad,
        idEmisor,
        contenido,
    } = mensaje;

    const result = await pool.query(
        `INSERT INTO mensaje
             (id_chat_individual, id_chat_actividad, id_emisor, contenido)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [idChatIndividual, idChatActividad, idEmisor, contenido]
    );

    return mapearMensaje(result.rows[0]);
};

//marcar como leído el mensaje
export const marcarMensajeLeido = async (idMensaje: number): Promise<Mensaje | null> => {
    const result = await pool.query(
        `UPDATE mensaje
         SET leido = TRUE
         WHERE id_mensaje = $1
         RETURNING *`,
        [idMensaje]
    );
    if (result.rows.length === 0) return null;
    return mapearMensaje(result.rows[0]);;
};


//actualiza el contenido del mensaje
export const actualizarMensaje = async (idMensaje: number, nuevoContenido: string): Promise<Mensaje | null> => {
    const result = await pool.query(
        `UPDATE mensaje
         SET contenido = $1
         WHERE id_mensaje = $2
         RETURNING *`,
        [nuevoContenido, idMensaje]
    );
    if (result.rows.length === 0) return null;
    return mapearMensaje(result.rows[0]);
};


export const eliminarMensaje = async (idMensaje: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM mensaje WHERE id_mensaje = $1", [idMensaje]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
}