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
}