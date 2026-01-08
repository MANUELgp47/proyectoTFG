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

    //obtine los usuarios participantes de una actividad
    static async getUsuariosParticipantes(idActividad: number): Promise<number[]> {
        const usuariosParticipantes = await ActividadModel.getParticipantesDeActividad(idActividad);
        return usuariosParticipantes;
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
}