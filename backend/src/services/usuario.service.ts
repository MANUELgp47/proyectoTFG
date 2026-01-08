import type { CrearUsuario } from '../types/usuario.js';
import * as UsuarioModel from '../models/usuario.model.js';

export class UsuarioService {
    static async crearUsuario(usuarioData: CrearUsuario): Promise<CrearUsuario> {
        const nuevoUsuario = await UsuarioModel.crearUsuario(usuarioData);
        return nuevoUsuario;
    }

    static async obtenerUsuarioPorId(idUsuario: number): Promise<CrearUsuario | null> {
        const usuario = await UsuarioModel.getUsuarioPorId(idUsuario);
        return usuario;
    }

    //existe usuario por email
    static async existeUsuarioPorEmail(email: string): Promise<boolean> {
        const existe = await UsuarioModel.existeUsuarioPorEmail(email);
        return existe;
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
}