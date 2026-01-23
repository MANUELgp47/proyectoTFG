import type { CreaActividad } from '../types/actividad.js';
import * as ActividadModel from '../models/actividad.model.js';
import type { Request } from 'express';
import {actualizarEstadoActividad, getParticipantesDeActividad} from "../models/actividad.model.js";

export class ActividadService {
    static async getActividadesCaducadas(): Promise<number[]> {
        const actividadesCaducadas = await ActividadModel.getActividadesCaducadas();
        return actividadesCaducadas;
    }

    static async marcarActividadComoFinalizada(idActividad: number): Promise<CreaActividad | null> {
        const estado : 'finalizada' = 'finalizada';
        const actualizarEstadoActividad = await ActividadModel.actualizarEstadoActividad(idActividad, estado);
        return actualizarEstadoActividad;
    }

    //existe actividad
    static async existeActividad(idActividad: number): Promise<boolean> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad !== null;
    }

    //obtine los usuarios participantes de una actividad
    static async getUsuariosParticipantes(idActividad: number): Promise<number[]> {
        const usuariosParticipantes = await ActividadModel.getParticipantesDeActividad(idActividad);
        return usuariosParticipantes;
    }
    //devuelve el id del creador de una actividad
    static async getIdCreadorActividad(idActividad: number): Promise<number | null> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad ? actividad.idCreador : null;
    }

    //Comprueba si el ID es el creador de la actividad
    static async esCreadorActividad(idActividad: number, idUsuario: number): Promise<boolean> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        if (!actividad) {
            return false;
        }
        console.log("Comparando idUsuario " + idUsuario + " con idCreador " + actividad.idCreador);

        if (actividad.idCreador === idUsuario) {
            return true;
        }
        return false;
    }


    //get actividad por id
    static async getActividadPorId(idActividad: number): Promise<CreaActividad | null> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad;
    }

    //comprueba si un usuario es participante de una actividad
    static async esUsuarioParticipante(idActividad: number, idUsuario: number): Promise<boolean> {
        const participantes = await ActividadModel.getParticipantesDeActividad(idActividad);
        return participantes.includes(idUsuario);
    }

    //get nombre de la actividad
    static async getNombreActividad(idActividad: number): Promise<string | null> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad ? actividad.titulo : null;
    }

    //devuelve el estado de una actividad
    static async getEstadoActividad(idActividad: number): Promise<string | null> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad ? actividad.estado : null;
    }

    //devuelve el numero de participantes que faltan para que se llegue al maximo. Si no tiene maximo devuelve -2. Si la actividad no existe devuelve -1
    static async getCupoDisponible(idActividad: number): Promise<number> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        if (!actividad) {//actividad no existe
            return -1;
        }
        if (actividad.participantesmax === 0 || actividad.participantesmax === undefined) {//actividad sin maximo
            return -2;
        }
        const participantes = await ActividadModel.getParticipantesDeActividad(idActividad);
        const cupoDisponible = actividad.participantesmax - participantes.length;
        return cupoDisponible;
    }
}