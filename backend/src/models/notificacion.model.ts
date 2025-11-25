import pool from "../db.js";
import type {Notificacion, CrearNotificacion} from "../types/notificacion.js";
import {mapearNotificacion} from "../utils/mappers.js";


export const getAllNotificacions = async (): Promise<Notificacion[]> => {
    const result = await pool.query("SELECT * FROM notificacion");
    return result.rows.map(mapearNotificacion);
};

export const getNotificacionPorId = async (idNotificacion: number): Promise<Notificacion | null> => {
    const result = await pool.query("SELECT * FROM notificacion WHERE id_notificacion = $1", [idNotificacion]);
    if (result.rows.length === 0) return null;
    return mapearNotificacion(result.rows[0]);
};

export const getNotificacionesPorUsuario = async (idUsuarioReceptor: number): Promise<Notificacion[]> => {
    const result = await pool.query("SELECT * FROM notificacion WHERE id_usuario_receptor = $1 ORDER BY fecha_creacion DESC", [idUsuarioReceptor]);
    return result.rows.map(mapearNotificacion);
};

export const crearNotificacion = async (notificacion: CrearNotificacion): Promise<Notificacion> => {
    const {
        idUsuarioReceptor,
        mensaje,
        tipo,
        idReferencia,
    } = notificacion;

    const result = await pool.query(
        `INSERT INTO notificacion
             (id_usuario_receptor, mensaje, tipo, id_referencia)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [idUsuarioReceptor, mensaje, tipo, idReferencia]
    );

    return mapearNotificacion(result.rows[0]);
};

//actualizar una notificación por id para marcarla como leida o no leida

export const actualizarNotificacion = async (idNotificacion: number, leida: boolean): Promise<Notificacion | null> => {
  //  console.log("Leida en el modelo:", leida);
    leida= Boolean(leida)
    const result = await pool.query(
        `UPDATE notificacion
         SET leida = $1
         WHERE id_notificacion = $2
         RETURNING *`,
        [leida, idNotificacion]
    );
    if (result.rows.length === 0) return null;
    return mapearNotificacion(result.rows[0]);
};

export const eliminarNotificacion = async (idNotificacion: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM notificacion WHERE id_notificacion = $1", [idNotificacion]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};
