import * as amistadModel from '../models/amistad.model.js';
import {type Request, type Response} from 'express';
import {UsuarioService} from "./usuario.service.js";
import * as AmistadModel from "../models/amistad.model.js";
import type {Amistad} from "../types/amistad.js";
import * as SettingsModelo from "../models/settings.model.js";
import type {Settings} from "../types/settings.js";

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

        //comprueba que existen los usuarios, que si el usuario en cuestión tiene perfil privado yo tengo que ser amigo. y que no estoy en la lista de bloqueados del otro usuario


    }
    //tengo permiso? TODO hacer cuando todos los users tengan settings
    static async tengoPermisoParaVerPerfil(yo: number, idUsuario2: number) : Promise<boolean> {
        //existen los usuarios
      /*      const usuario2 = await UsuarioService.existeUsuarioPorId(idUsuario2);
            const usuarioYo = await UsuarioService.existeUsuarioPorId(yo);
            if (!usuario2 || !usuarioYo) {
                return false;
            }

        //si perfil privado y yo no amigo, no tengo permiso
        const settingsUsuario2 = await SettingsModelo.getSettings(idUsuario2);
        if (!settingsUsuario2?.perfilPublico) {//si perfil privado
            const soyAmigo = await AmistadService.existeAmistad(yo, idUsuario2);
            if (!soyAmigo) {//si perfil privado y no soy amigo, no tengo permiso
                console.log("no soy amigo y perfil privado");
                return false;
            }
        }

        //si yo bloqueado por el otro usuario, no tengo permiso
        if (settingsUsuario2?.usuariosBloqueados && settingsUsuario2.usuariosBloqueados.includes(yo)) {
            return false;
        }
*/
        return true;
    }



/*
    //obtener todas las amistades de un usuario
    static async getAmistadesDeUsuario(idUsuario: number): Promise<Amistad[]> {
        const amistades = await amistadModel.getAmistadesPorUsuario(idUsuario);
        return amistades;
    }
    */

}