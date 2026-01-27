import pool from "../db.js";
import type {SolicitudAmistad, CrearSolicitudAmistad} from "../types/solicitudAmistad.js";
import {mapearSolicitudAmistad} from "../utils/mappers.js";

export const getAllSolicitudesAmistad = async (): Promise<SolicitudAmistad[]> => {
    const result = await pool.query("SELECT * FROM solicitud_amistad");
    return result.rows.map(mapearSolicitudAmistad);
};
// Obtener una solicitud de amistad específica por idEmisor e idReceptor en ambos ordenes
export const getSolicitudAmistad = async (idEmisor: number, idReceptor: number): Promise<SolicitudAmistad | null> => {
    const result = await pool.query(
        "SELECT * FROM solicitud_amistad WHERE (id_emisor = $1 AND id_receptor = $2) OR (id_emisor = $2 AND id_receptor = $1)",
        [idEmisor, idReceptor]
    );
    if (result.rows.length === 0) return null;
    return mapearSolicitudAmistad(result.rows[0]);
};
/*
export const getSolicitudAmistad = async (idEmisor: number, idReceptor: number): Promise<SolicitudAmistad | null> => {
    const result = await pool.query("SELECT * FROM solicitud_amistad WHERE id_emisor = $1 AND id_receptor = $2", [idEmisor, idReceptor]);
    if (result.rows.length === 0) return null;
    return mapearSolicitudAmistad(result.rows[0]);
};*/

export const getSolicitudesPorReceptor = async (idReceptor: number): Promise<SolicitudAmistad[]> => {
    const result = await pool.query("SELECT * FROM solicitud_amistad WHERE id_receptor = $1", [idReceptor]);
    return result.rows.map(mapearSolicitudAmistad);
};

export const crearSolicitudAmistad = async (solicitud: CrearSolicitudAmistad): Promise<SolicitudAmistad> => {
    const {idEmisor, idReceptor} = solicitud;
    const result = await pool.query(
        `INSERT INTO solicitud_amistad
             (id_emisor, id_receptor, fecha_envio, estado)
         VALUES ($1, $2, NOW(), 'pendiente') RETURNING *`,
        [idEmisor, idReceptor]
    );
    return mapearSolicitudAmistad(result.rows[0]);
};

//crea solicitud con recepcion por parametros de idEmisor e idReceptor
export const crearSolicitudAmistadPorIds = async (idEmisor: number, idReceptor: number): Promise<SolicitudAmistad> => {
    const result = await pool.query(
        `INSERT INTO solicitud_amistad
             (id_emisor, id_receptor, fecha_envio, estado)
         VALUES ($1, $2, NOW(), 'pendiente') RETURNING *`,
        [idEmisor, idReceptor]
    );
    return mapearSolicitudAmistad(result.rows[0]);
};



//actualiza el estado de una solicitud de amistad
export const actualizarEstadoSolicitudAmistad = async (idEmisor: number, idReceptor: number, nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada'): Promise<boolean> => {

   // console.log('Actualizando estado de solicitud de amistad:', {idEmisor, idReceptor, nuevoEstado});
    const result = await pool.query(
        "UPDATE solicitud_amistad SET estado = $1 WHERE id_emisor = $2 AND id_receptor = $3",
        [nuevoEstado, idEmisor, idReceptor]
    );
    return result.rowCount === 1; // Devuelve true si se actualizó una fila, false si no
};
export const eliminarSolicitudAmistad = async (idEmisor: number, idReceptor: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM solicitud_amistad WHERE id_emisor = $1 AND id_receptor = $2", [idEmisor, idReceptor]);
    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};