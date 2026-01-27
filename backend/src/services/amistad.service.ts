import * as amistadModel from '../models/amistad.model.js';
import type { Request, Response } from 'express';
import {UsuarioService} from "./usuario.service.js";
import * as AmistadModel from "../models/amistad.model.js";
import type {Amistad} from "../types/amistad.js";

export class AmistadService {
    //obtener si existe una amistad entre dos usuarios
    static async existeAmistad(idUsuario1: number, idUsuario2: number): Promise<boolean> {
        const amistad = await amistadModel.getAmistadPorUsuarios(idUsuario1, idUsuario2);
        const amistadInversa = await amistadModel.getAmistadPorUsuarios(idUsuario2, idUsuario1);
        return amistad !== null || amistadInversa !== null;
    }

    //crear amistad entre dos usuarios
    static async crearAmistad(idUsuario1: number, idUsuario2: number): Promise<{valido: boolean, mensaje: string | Amistad}> {

        //existen los usuarios

        //no pueden ser el mismo usuario
        if (idUsuario1 === idUsuario2) {

            return {valido: false, mensaje: 'No se puede crear una amistad consigo mismo'};

        }

        //TODO: Validar que existe una solicitud de amistad aceptada entre los dos usuarios antes de crear la amistad

        if (!idUsuario2 || !idUsuario1) {

            return {valido: false, mensaje: 'Falta el id del un usuario'};

        }


        const usuario1 = await UsuarioService.existeUsuarioPorId(idUsuario1);
        const usuario2 = await UsuarioService.existeUsuarioPorId(idUsuario2);

        if (!usuario1 || !usuario2) {

            return {valido: false, mensaje: 'Uno o ambos usuarios no existen'};
        }

        //ya existe la amistad
        const amistadExistente = await AmistadService.existeAmistad(idUsuario1, idUsuario2);
        if (amistadExistente) {

            return {valido: false, mensaje: 'La amistad ya existe'};
        }


            try {
                const amistad = await AmistadModel.crearAmistad(idUsuario1, idUsuario2);
                return {valido: true, mensaje: amistad};

            } catch (error) {
                return {valido: false, mensaje: 'Error del servidor'};


        }

    }



/*
    //obtener todas las amistades de un usuario
    static async getAmistadesDeUsuario(idUsuario: number): Promise<Amistad[]> {
        const amistades = await amistadModel.getAmistadesPorUsuario(idUsuario);
        return amistades;
    }
    */

}