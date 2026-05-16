import type {CrearRecuerdo} from "../types/recuerdo.js";
import * as RecuerdoModel from '../models/recuerdo.model.js';
import {ActividadService} from "./actividad.service.js";


export class RecuerdoService {
    static async obtenerTodosLosRecuerdos() : Promise<CrearRecuerdo[]> {
        const recuerdos = await RecuerdoModel.getAllRecuerdos();
        return recuerdos;
    }

    static async crearNuevoRecuerdo(recuerdo: CrearRecuerdo) : Promise<CrearRecuerdo> {
        const nuevoRecuerdo = await RecuerdoModel.crearRecuerdo(recuerdo);
        return nuevoRecuerdo;
    }

    static async eliminarRecuerdoPorId(idRecuerdo: number) : Promise<boolean> {
        const eliminado = await RecuerdoModel.deleteRecuerdoPorId(idRecuerdo);
        return eliminado;
    }

    //comprueba si un usuario tiene un recuerdo en una actividad
    static async usuarioTieneRecuerdoEnActividad(idUsuario: number, idActividad: number) : Promise<boolean> {
        const recuerdos = await RecuerdoModel.getRecuerdosPorActividad(idActividad);
        for (const recuerdo of recuerdos) {
            if (recuerdo.idUsuario === idUsuario) {
                return true;
            }
        }
        return false;
    }

    //get recuerdo por id
    static async getRecuerdoPorId(idRecuerdo: number) : Promise<CrearRecuerdo | null> {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        return recuerdo;
    }

    //devuelve el id del creador de un recuerdo
    static async getIdCreadorRecuerdo(idRecuerdo: number) : Promise<number | null> {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        return recuerdo ? recuerdo.idUsuario : null;
    }

    //devuelve true si el recuerdo existe
    static async existeRecuerdo(idRecuerdo: number) : Promise<boolean> {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        return recuerdo !== null;
    }

    //devuelve el titulo del recuerdo por su id
    static async getTituloRecuerdoPorId(idRecuerdo: number) : Promise<string | null> {
        const recuerdo = await RecuerdoModel.getRecuerdoPorId(idRecuerdo);
        return recuerdo ? recuerdo.titulo : null;
    }


    //funcion que valida los datos (id usuario e id actividad) devuelve un boolean y un mensaje de error en caso de que no sea valido
    static async validarDatosRecuerdo(idUsuario: number, idActividad: number) : Promise<{valido: boolean, mensaje?: string}> {


        if (!idActividad || !idUsuario || isNaN(idActividad) || isNaN(idUsuario)) {
            return {valido: false, mensaje: 'Faltan datos obligatorios'};
        }
        //existe idActividad
        const actividadSeleccionada = await ActividadService.getActividadPorId(idActividad);
        if (!actividadSeleccionada || actividadSeleccionada === null) {
            return {valido: false, mensaje: 'La actividad no existe'};
        }
        //es participante el usuario que crea el recuerdo
        const esParticipante = await ActividadService.esUsuarioParticipante(idActividad, idUsuario);
        if (!esParticipante) {
            return {valido: false, mensaje: 'El usuario no es participante de la actividad'};
        }


        return {valido: true};
    }
}