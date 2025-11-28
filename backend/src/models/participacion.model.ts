import pool from "../db.js";
import type {Participacion, Crearparticipacion} from "../types/participacion.js";
import {mapearParticipacion} from "../utils/mappers.js";
import * as ActividadModel from "./actividad.model.js";

export const getAllParticipacions = async (): Promise<Participacion[]> => {
    const result = await pool.query("SELECT * FROM participacion");
    return result.rows.map(mapearParticipacion);
};

export const getParticipacionPorId = async (idUsuario: number, idActividad: number): Promise<Participacion | null> => {
    const result = await pool.query("SELECT * FROM participacion WHERE id_usuario = $1 AND id_actividad = $2", [idUsuario, idActividad]);
    if (result.rows.length === 0) return null;
    return mapearParticipacion(result.rows[0]);
};

export const getParticipacionesPorActividad = async (idActividad: number): Promise<Participacion[]> => {
    const result = await pool.query("SELECT * FROM participacion WHERE id_actividad = $1", [idActividad]);
    return result.rows.map(mapearParticipacion);
    ;
};
//devuelve el numero de participantes que participan en una actividad
export const getNumeroParticipantesPorActividad = async (idActividad: number): Promise<number> => {
    const result = await pool.query("SELECT COUNT(*) FROM participacion WHERE id_actividad = $1", [idActividad]);
    return parseInt(result.rows[0].count, 10);
};

//todas las participaciones de un usuario
export const getParticipacionesPorUsuario = async (idUsuario: number): Promise<Participacion[]> => {
    const result = await pool.query("SELECT * FROM participacion WHERE id_usuario = $1", [idUsuario]);
    return result.rows.map(mapearParticipacion);
};

export const crearParticipacion = async (participacion: Crearparticipacion): Promise<Participacion> => {
    let {
        idUsuario,
        idActividad,
        esCreador = false,
        aceptada

    } = participacion;

    //si el numero de participantes maximo es igual a actividadModel.getparticipantes() no se puede crear la participacion

    const activida =await ActividadModel.getActividadPorId(idActividad);
    const participantes = await getNumeroParticipantesPorActividad(idActividad);
    let participantesMaximos = activida?.participantesmax ?? 0;


    if (participantesMaximos <= participantes && participantesMaximos > 0) {
        throw new Error(`No se puede crear la participación: se alcanzó el número máximo de participantes. ${participantes} de ${participantesMaximos}`);
    }



    //si el id_usuario es igual al id_creador de la actividad esCreador=true
    //extraer el id_creador de la actividad
    const actividadResult = await pool.query("SELECT id_creador FROM actividad WHERE id_actividad = $1", [idActividad]);
    if (actividadResult.rows.length === 0) {
        throw new Error("La actividad no existe");
    }

    if (actividadResult.rows[0].id_creador === idUsuario) {
        esCreador = true
    }

    const result = await pool.query(
        `INSERT INTO participacion
             (id_usuario, id_actividad, es_creador, aceptada)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [idUsuario, idActividad, esCreador, aceptada]
    );

    return mapearParticipacion(result.rows[0]);
};

//Aceptar una participacion
export const actualizaEstadoParticipacion = async (idUsuario: number, idActividad: number, aceptada: boolean): Promise<Participacion | null> => {
    const result = await pool.query(
        `UPDATE participacion
         SET aceptada = $3
         WHERE id_usuario = $1 AND id_actividad = $2
         RETURNING *`,
        [idUsuario, idActividad, aceptada]
    );
    if (result.rows.length === 0) return null;
    return mapearParticipacion(result.rows[0]);
};

//Eliminar una participacion
export const eliminarParticipacion = async (idUsuario: number, idActividad: number): Promise<void> => {
    await pool.query("DELETE FROM participacion WHERE id_usuario = $1 AND id_actividad = $2", [idUsuario, idActividad]);
};