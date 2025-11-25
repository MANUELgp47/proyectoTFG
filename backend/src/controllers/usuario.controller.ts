import type {Request, Response} from 'express';
import * as UsuarioModel from '../models/usuario.model.js';

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
        const usuario = await UsuarioModel.crearUsuario(req.body);
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
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: 'ID requerido' });
        }
        const idUsuario = Number.parseInt(idParam, 10);
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const usuarioActualizado = await UsuarioModel.actualizarUsuario(idUsuario, req.body);
        if (usuarioActualizado) {
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
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: 'ID requerido' });
        }
        const idUsuario = Number.parseInt(idParam, 10);
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
