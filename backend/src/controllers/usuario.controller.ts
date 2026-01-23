import type {Request, Response} from 'express';
import * as UsuarioModel from '../models/usuario.model.js';
import * as UsuarioService from '../services/usuario.service.js';

export const getUsuarios = async (req: Request, res: Response) => {//async para manejar operaciones asincrónicas y await para esperar la respuesta de la base de datos
    try {
        const usuarios = await UsuarioModel.getAllUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
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
        res.status(500).json({ message: 'Error del servidor' });
    }
};


//actualizar usuario
//establecer campos no actualizables
export const updateUsuario = async (req: Request, res: Response) => {
    try {

        if (!req.userId) {
            return res.status(400).json({ message: 'ID requerido' });
        }
        if (Number.isNaN(req.userId)) {//asegura que el id es un número
            return res.status(400).json({ message: 'ID inválido' });
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
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const idParam = req.userId;
        if (!idParam) {
            return res.status(400).json({ message: 'ID requerido' });
        }
        const idUsuario = idParam;
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const exito = await UsuarioModel.eliminarUsuario(idUsuario);
        if (exito) {
            res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
