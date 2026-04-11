import type {CreaActividad} from '../types/actividad.js';
import * as ActividadModel from '../models/actividad.model.js';
import db from '../db.js';
import * as ParticipacionModel from "../models/participacion.model.js";
import {mapearActividad} from "../utils/mappers.js";

interface FilterParams {
    titulo?: string;
    ubicacion?: string;
    publica?: string; // se espera 'true'|'false' como string en la petición
    fecha?: string;
    participantesmax?: string;
    estado?: 'activa' | 'finalizada' | 'cancelada';
    tags?: string;
}

export class ActividadService {
    static async getActividadesCaducadas(): Promise<number[]> {
        const actividadesCaducadas = await ActividadModel.getActividadesCaducadas();
        return actividadesCaducadas;
    }


    static async marcarActividadComoFinalizada(idActividad: number): Promise<CreaActividad | null> {
        const estado: 'finalizada' = 'finalizada';
        const actualizarEstadoActividad = await ActividadModel.actualizarEstadoActividad(idActividad, estado);
        return actualizarEstadoActividad;
    }

    //devuelve el estado de una actividad
    static async getEstadoDeActividad(idActividad: number): Promise<string | null> {
        const actividad = await ActividadModel.getActividadPorId(idActividad);
        return actividad ? actividad.estado : null;
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
    //es participante
    static async esParticipante(idActividad: number, idUsuario: number): Promise<boolean> {
        const usuariosParticipantes = await ActividadModel.getParticipantesDeActividad(idActividad);
        return usuariosParticipantes.includes(idUsuario);
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


    //get actividades de un usuario
    static async getActividadesDeUsuario(idUsuario: number): Promise<CreaActividad[]> {
        const actividades = await ActividadModel.getActividadesDeUsuario(idUsuario);
        return actividades;
    }

    //actividades en las que participa un usuario
    static async getActividadesQueParticipo(idUsuario: number): Promise<CreaActividad[]> {
        const actividades = await ParticipacionModel.getParticipacionesPorUsuario(idUsuario);
        const actividadesParticipadas = actividades.map(participacion => participacion.idActividad);
        const actividadesParticipadasDetalles = [];
        for (const idActividad of actividadesParticipadas) {
            const actividad = await ActividadModel.getActividadPorId(idActividad);
            if (actividad) {
                actividadesParticipadasDetalles.push(actividad);
            }
        }
        return actividadesParticipadasDetalles;
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

    //TODO arregla estado. y hacer que si no encuentra resultado no devulve nada
    static async getFiltered(filters: FilterParams): Promise<any[]> {
        const {titulo, ubicacion, publica, fecha, participantesmax, estado, tags} = filters;

        console.log(titulo, ubicacion, ubicacion, "tags ",tags);
        //Convertir tag en array de string dividido por las ',' y eliminar espacios en blanco de el principio y el final de cada tag, y eliminar tags vacíos
        let tagsArray: string[] = [];
        if (tags) {
            tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        }




         console.log("tags:  ",tagsArray);

        //comprueba que los parametros son del tipo correcto
        if (titulo && typeof titulo !== "string") {
            throw new Error("El título debe ser una cadena de texto");
        }
        if (ubicacion && typeof ubicacion !== "string") {
            throw new Error("La ubicación debe ser una cadena de texto");
        }
        if (publica !== undefined && typeof publica !== "string") {
            throw new Error("El parámetro 'publica' debe ser una cadena de texto ('true' o 'false')");
        }
        if (fecha && isNaN(Date.parse(fecha))) {
            throw new Error("La fecha debe ser un formato de fecha válido");
        }
        if (participantesmax !== undefined && typeof participantesmax !== "string") {
            throw new Error("El parámetro 'participantesmax' debe ser una cadena de texto que represente un número");
        }
        if (estado !== undefined && !['activa', 'finalizada', 'cancelada'].includes(estado)) {
            throw new Error("El estado debe ser 'activa', 'finalizada' o 'cancelada'");

        }
        //      console.log("estado ",estado);


        let query = "SELECT * FROM actividad WHERE 1=1";
        const params: (string | number | boolean | string[])[] = [];


        //Filtrar por título
        if (titulo) {
            params.push(`%${titulo}%`);
            query += ` AND titulo ILIKE $${params.length}`;
        }

        //Filtrar por ubicación
        if (ubicacion) {
            params.push(`%${ubicacion}%`);
            query += ` AND ubicacion ILIKE $${params.length}`;
        }

        //Filtrar por pública
        if (publica !== undefined) {
            params.push(publica === "true");
            query += ` AND publica = $${params.length}`;
        }

        // Filtrar por fecha (actividades que empiezan después de esa fecha)
        if (fecha) {
            params.push(fecha);
            query += ` AND fecha_inicio >= $${params.length}`;
        }

        // Filtrar por número máximo de participantes (acepta '0' y otros valores numéricos)
        if (typeof participantesmax !== 'undefined' && participantesmax !== null) {
            const raw = String(participantesmax).trim();
            if (raw !== '') {
                const max = parseInt(raw, 10);
                if (!Number.isNaN(max)) {
                    params.push(max);
                    query += ` AND participantes_max <= $${params.length}`;
                }
            }
        }

        // Filtrar por estado
        if (estado && ['activa', 'finalizada', 'cancelada'].includes(estado)) {
            params.push(estado);
            query += ` AND estado = $${params.length}`;
        }


        // Filtrar por tags (si se proporcionan tags, se buscan actividades que tengan al menos uno de esos tags)
      /*  if (tagsArray.length > 0) {
            params.push(tagsArray);

            query += `
            AND a.id IN (
                SELECT at.id_actividad
                FROM actividad_tag at
                WHERE at.nombre = ANY($${params.length})
            )
        `;
        }*/
            if (tagsArray.length > 0) {
            params.push(tagsArray);

            query += `
            AND id_actividad IN (
                SELECT at.id_actividad
                FROM actividad_tag at
                JOIN tag t ON at.id_tag = t.id_tag
                WHERE t.nombre = ANY($${params.length})
            )
        `;
            }


        const result = await db.query(query, params);
      //  return result.rows as CreaActividad[];
       return result.rows.map(mapearActividad);
    };

    //es admin
        static async esAdminActividad(idActividad: number, idUsuario: number): Promise<boolean> {
            const actividad = await ActividadModel.getActividadPorId(idActividad);
            if (!actividad) {
                return false;
            }
            const admins = actividad.admins || [];//si no tiene admins, devuelve un array vacío para evitar errores
            return admins.includes(idUsuario);
        }

        //es expulsado
        static async esExpulsadoActividad(idActividad: number, idUsuario: number): Promise<boolean> {
            const actividad = await ActividadModel.getActividadPorId(idActividad);
            if (!actividad) {
                return false;
            }
            const expulsados = actividad.expulsados || [];//si no tiene expulsados, devuelve un array vacío para evitar errores
            return expulsados.includes(idUsuario);
        }

}
