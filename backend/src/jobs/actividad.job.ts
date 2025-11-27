//TODO:
//1. Crear una rutina que obtiene todas las actividades de estado activo y con fecha fin < fecha actual
//2. Cambiar el estado de esas actividades a 'finalizada'
//3. Notificar a los usuarios participantes de la actividad que esta ha sido finalizada

import {ActividadService} from '../services/actividad.service.js';
import {NotificacionService} from '../services/notificacion.service.js';
import type {CrearNotificacion} from '../types/notificacion.js';
import type {Actividad, CreaActividad} from '../types/actividad.js';
import * as ActividadModel from '../models/actividad.model.js';
import type {Request} from 'express';
import * as UsuarioModel from '../models/usuario.model.js';

import cron from 'node-cron';

// Ejecuta la función cada minuto

/*
* * * * * → cada minuto
0 * * * * → cada hora en el minuto 0
0 0 * * * → cada día a medianoche
 */


cron.schedule('* * * * *', async () => {
    console.log('Ejecutando rutina cada minuto:', new Date().toLocaleString());

    //1. Obtener actividades caducadas
    const actividades = await ActividadService.getActividadesCaducadas()
    //si no hay actividades caducadas, salir
    if (actividades.length === 0) {
        return;
    } else {
        await finalizarActividadesCaducadas(actividades);
    }

});

export const finalizarActividadesCaducadas = async (actividades: number[]): Promise<boolean> => {
    try {
        await Promise.all(actividades.map(async (actividadID: number) => {//promise all para esperar a que todas las actividades se finalicen
            await ActividadService.marcarActividadComoFinalizada(actividadID);

            const participantes = await ActividadService.getUsuariosParticipantes(actividadID);
            const actividadPorId = await ActividadModel.getActividadPorId(actividadID);
            const tituloActividad = actividadPorId ? actividadPorId.titulo : 'desconocida';

            await Promise.all(participantes.map(async (participanteId: number) => {
                await NotificacionService.creaNotificacionPorParametros(
                    participanteId,
                    'posibilidad_recuerdo',
                    `La actividad con llamada ${tituloActividad} ha sido finalizada. Y tiene la posibilidad de crear un recuerdo sobre ella.`,
                    actividadID
                );
            }));
        }));
        return true;
    } catch (error) {
        console.error('Error al finalizar actividades caducadas:', error);
        return false;
    }
};


/*
export const finalizarActividadesCaducadas  = async (actividades: number[]): Promise<Boolean> => {
    //2. Cambiar estado a finalizada y notificar a participantes
    actividades.forEach(async (actividadID: number) => {
        await ActividadService.marcarActividadComoFinalizada(actividadID);

        //3. Notificar a participantes
        const participantes = await ActividadService.getUsuariosParticipantes(actividadID);
        const actividadPorId = await ActividadModel.getActividadPorId(actividadID);
        const tituloActividad = actividadPorId ? actividadPorId.titulo : 'desconocida';

        participantes.forEach(async (participanteId: number) => {
            await NotificacionService.creaNotificacionPorParametros(
                participanteId,
                'posibilidad_recuerdo',
                `La actividad con llamada ${tituloActividad} ha sido finalizada. Y tiene la posibilidad de crear un recuerdo sobre ella.`,
                actividadID
            )

        })
    });
};
*/
