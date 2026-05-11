import type {CrearUsuario} from '../types/usuario.js';
import * as UsuarioModel from '../models/usuario.model.js';
import bcrypt from 'bcrypt';
import * as SettingsModel from '../models/settings.model.js';
import {actualizarVerificado} from "../models/usuario.model.js";

export class UsuarioService {

    /*
    Todo: crear usuario
    hashear contraseña
    validar email / usuario (que no exista)
    llamar al model
     */
    static async crearUsuario(usuarioData: CrearUsuario): Promise<CrearUsuario> {

        try {
            //Comprueba que no exista el email
            const existeEmail = await this.existeUsuarioPorEmail(usuarioData.email);
            if (existeEmail) {
                throw new Error('El email ya está en uso');
            }
            //Comprueba que no exista el nombre de usuario
            const existeNombreUsuario = await this.existeUsuarioPorNombreUsuario(usuarioData.nombreUsuario);
            if (existeNombreUsuario) {
                throw new Error('El nombre de usuario ya está en uso');
            }

            //TODO: hashear la contraseña antes de guardarla (pendiente de implementar)

           // const hash:string = this.generarContrasenaHasheada(usuarioData.contrasena);

            const hash = await bcrypt.hash(usuarioData.contrasena, 10);//usar 10 rondas porque es el estándar
            usuarioData.contrasena = hash;


            //crear usuario llamando al model
            const nuevoUsuario = await UsuarioModel.crearUsuario(usuarioData);
            return nuevoUsuario;

        } catch (error) {
            throw error;
        }


    }
    //genera contraseña hasheada
    static async generarContrasenaHasheada(contrasena: string): Promise<string> {
        const hash = await bcrypt.hash(contrasena, 10);
        return hash;
    }

    static async obtenerUsuarioPorId(idUsuario: number): Promise<CrearUsuario | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        return usuario;
    }

    //obtiene privacidad de un usuario por id
    static async obtenerPrivacidadPorId(idUsuario: number): Promise<{ perfilPublico: boolean, actividadPublica: boolean } | null> {
        const settings = await SettingsModel.getSettings(idUsuario);
        if (!settings) {
            return null;
        }
        return {
            perfilPublico: settings.perfilPublico,
            actividadPublica: settings.actividadPublica
        };
    }


    //verifica al usuario
    static async verificarUsuario(idUsuario: number): Promise<CrearUsuario | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        if (!usuario) {
            return null;
        }
        usuario.verificado = true;
        await UsuarioModel.actualizarVerificado(usuario.idUsuario, true);
        return usuario;
    }


    //obtiene usuario por email
    static async obtenerUsuarioPorEmail(email: string): Promise<CrearUsuario | null> {
        const usuario = await UsuarioModel.getUsuarioPorEmail(email);
        return usuario;
    }

    //existe usuario por email
    static async existeUsuarioPorEmail(email: string): Promise<boolean> {
        const existe = await UsuarioModel.existeUsuarioPorEmail(email);
        return existe;
    }

    //obtiene usuario por nombre de usuario
    static async obtenerUsuarioPorNombreUsuario(nombreUsuario: string): Promise<CrearUsuario | null> {
        const usuario = await UsuarioModel.getUsuarioPorNombreUsuario(nombreUsuario);
        return usuario;
    }

    //existe usuario por nombre de usuario
    static async existeUsuarioPorNombreUsuario(nombreUsuario: string): Promise<boolean> {
        const existe = await UsuarioModel.existeUsuarioPorNombreUsuario(nombreUsuario);
        return existe;
    }

    //existe usuario por id
    static async existeUsuarioPorId(idUsuario: number): Promise<boolean> {
        const existe = await UsuarioModel.existeUsuarioPorId(idUsuario);
        return existe;
    }

    //nombre de usuario por id
    static async getNombreUsuarioPorId(idUsuario: number): Promise<string | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        return usuario ? usuario.nombreUsuario : null;
    }

    //obtener rol por id de usuario
    static async getRolPorIdUsuario(idUsuario: number): Promise<string | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        return usuario ? usuario.rol : null;
    }

    //obtenerDatosMinimosUsuarioPorId
    static async obtenerDatosMinimosUsuarioPorId(idUsuario: number): Promise<{ idUsuario: number, nombreUsuario: string, imagen: string | undefined } | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        if (usuario) {
            return { idUsuario: usuario.idUsuario, nombreUsuario: usuario.nombreUsuario, imagen: usuario.imagen };
        }
        return null;
    }

    //busqueda de usuarios por nombreUsuario que contenga la cadena enviada, devuelve un array de idUsuario
    static async buscarUsuariosPorNombre(nombre: string): Promise<{ idUsuario: number | undefined }[]> {
        const usuarios = await UsuarioModel.buscarUsuariosPorNombre(nombre);
        return usuarios.map((usuario) => ({ idUsuario: usuario.idUsuario }));
    }
}