import pool from "../db.js";
import type {Actividad, CreaActividad} from "../types/actividad.js";
import { mapearActividad } from "../utils/mappers.js";

export const getAllActividads = async (): Promise<Actividad[]> => {
    const result = await pool.query("SELECT * FROM actividad");
    return result.rows.map(mapearActividad);
};

export const getActividadPorId = async (idActividad: number): Promise<Actividad | null> => {
    const result = await pool.query("SELECT * FROM actividad WHERE id_actividad = $1", [idActividad]);
    if (result.rows.length === 0) return null;
    return mapearActividad(result.rows[0]);
};

export const crearActividad = async (actividad: CreaActividad): Promise<Actividad> => {
    const {
        idCreador,
        titulo,
        descripcion,
        fechaInicio,
        fechaFin,
        ubicacion,
        publica,
        participantesmax,
        imagenes,
    } = actividad;

    const result = await pool.query(
        `INSERT INTO actividad 
      (id_creador, titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, publica, participantes_max, imagenes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
        [idCreador, titulo, descripcion, fechaInicio, fechaFin, ubicacion, publica, participantesmax, imagenes]
    );

    return mapearActividad(result.rows[0]);
};
//actualizar Actividad
export const actualizarActividad = async (idActividad: number, actividad: Partial<CreaActividad>): Promise<Actividad | null> => {
    // Construir la consulta dinámicamente según los campos proporcionados
    const campos = [];
    const valores = [];
    let indice = 1;
    for (const [key, value] of Object.entries(actividad)) {
        campos.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${indice}`);
        valores.push(value);
        indice++;
    }
    valores.push(idActividad); // Agregar el idActividad al final para la cláusula WHERE
    const consulta = `UPDATE actividad SET ${campos.join(', ')} WHERE id_actividad = $${indice} RETURNING *`;
    const result = await pool.query(consulta, valores);
    if (result.rows.length === 0) return null;
    return mapearActividad(result.rows[0]);
};

// actualizar estado de actividad
export const actualizarEstadoActividad = async (idActividad: number, estado: 'activa' | 'finalizada' | 'cancelada'): Promise<Actividad | null> => {
    const result = await pool.query(
        `UPDATE actividad SET estado = $1 WHERE id_actividad = $2 RETURNING *`,
        [estado, idActividad]
    );
    if (result.rows.length === 0) return null;
    return mapearActividad(result.rows[0]);
};

//obtiene los participantes de una actividad
export const getParticipantesDeActividad = async (idActividad: number): Promise<number[]> => {
    const result = await pool.query(
        `SELECT id_usuario FROM participacion WHERE id_actividad = $1 AND aceptada = true`,
        [idActividad]
    );
    return result.rows.map(row => row.id_usuario);
};

//obtener id de actividades con fecha fin menor a la actual y estado 'activa'
export const getActividadesCaducadas = async (): Promise<number[]> => {
    const result = await pool.query(
        `SELECT id_actividad FROM actividad WHERE fecha_fin < NOW() AND estado = 'activa'`
    );
    return result.rows.map(row => row.id_actividad);
};


export const eliminarActividad = async (idActividad: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM actividad WHERE id_actividad = $1", [idActividad]);

    return result.rowCount === 1 ;// Devuelve true si se eliminó una fila, false si no
};