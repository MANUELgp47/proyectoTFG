import type {Request, Response} from 'express';
import * as UsuarioModel from '../models/usuario.model.js';
import * as UsuarioService from '../services/usuario.service.js';
import * as SettingsModel from '../models/settings.model.js';
import {getSettings} from "../models/settings.model.js";


export const getUsuarios = async (req: Request, res: Response) => {//async para manejar operaciones asincrónicas y await para esperar la respuesta de la base de datos
    try {
        const usuarios = await UsuarioModel.getAllUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//obtener datos minimos de usuario por id {idUsuario, nombreUsuario}
export const getDatosMinimosUsuarioID = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.idUsuario;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idUsuario = parseInt(idParam, 10);
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const datosMinimos = await UsuarioService.UsuarioService.obtenerDatosMinimosUsuarioPorId(idUsuario);
        if (datosMinimos) {
            res.json(datosMinimos);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        console.error('Error al obtener datos mínimos de usuario por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}

//obtener el perfil de un usuario por id, ejecuta el getDatosMinimosUsuarioPorId o getUsuarioPorId dependiendo de susu settings de privacidad
export const getPerfilUsuarioID = async (req: Request, res: Response) => {
    try {
        console.log("perfil usuario",  req.params.idUsuario);
        const idParam = req.params.idUsuario;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idUsuario = parseInt(idParam, 10);
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const settings = await SettingsModel.getSettings(idUsuario);

        if (settings?.perfilPublico || req.userId === idUsuario) {
            const perfil = await UsuarioService.UsuarioService.obtenerUsuarioPorId(idUsuario);
            res.json(perfil);
        } else if (settings) {
            const perfil = await UsuarioService.UsuarioService.obtenerDatosMinimosUsuarioPorId(idUsuario);
            res.json(perfil);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    }
    catch (error) {
        console.error('Error al obtener perfil de usuario por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }

}

//obtener usuario por id
export const getUsuarioID = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.idUsuario;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idUsuario = parseInt(idParam, 10);
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const usuario = await UsuarioService.UsuarioService.obtenerUsuarioPorId(idUsuario);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};


export const createUsuario = async (req: Request, res: Response) => {
    try {
        const usuario = await UsuarioService.UsuarioService.crearUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        //muestra el body del error en la consola del servidor
        console.log(req.body)
        res.status(500).json({message: 'Error del servidor'});
    }
};


//actualizar usuario
//establecer campos no actualizables
export const updateUsuario = async (req: Request, res: Response) => {
    try {

        if (!req.userId) {
            return res.status(400).json({message: 'ID requerido'});
        }
        if (Number.isNaN(req.userId)) {//asegura que el id es un número
            return res.status(400).json({message: 'ID inválido'});
        }

        //si contiene contraseña, la hashea antes de actualizar
        if (req.body.contrasena) {
            const hash = await UsuarioService.UsuarioService.generarContrasenaHasheada(req.body.contrasena);
            req.body.contrasena = hash;
            console.log(req.body.contrasena);
        }

        const usuarioActualizado = await UsuarioModel.actualizarUsuario(req.userId, req.body);
        if (usuarioActualizado) {
            //TODO. Notificar al usuario que su perfil ha sido actualizado
            res.json(usuarioActualizado);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

//Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const idParam = req.userId;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idUsuario = idParam;
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const exito = await UsuarioModel.eliminarUsuario(idUsuario);
        if (exito) {
            res.json({message: 'Usuario eliminado correctamente'});
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};
