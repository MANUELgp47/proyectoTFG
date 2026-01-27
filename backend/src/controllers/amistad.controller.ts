import type {Request, Response} from 'express';
import * as AmistadModel from '../models/amistad.model.js';
import {UsuarioService} from "../services/usuario.service.js";
import {AmistadService} from '../services/amistad.service.js';
import {SolicitudAmistadService} from "../services/solicitudAmistad.service.js";

export const getAmistades = async (req: Request, res: Response) => {
    try {
        const amistades = await AmistadModel.getAllAmistad();
        res.json(amistades);
    } catch (error) {
        console.error('Error al obtener amistades:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
//amistad por usuarios
export const getAmistadPorUsuarios = async (req: Request, res: Response) => {
    const {idUsuario1, idUsuario2} = req.params;
    try {
        const amistad = await AmistadModel.getAmistadPorUsuarios(Number(idUsuario1), Number(idUsuario2));
        if (amistad) {
            res.json(amistad);
        } else {
            res.status(404).json({ message: 'Amistad no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener amistad:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//todas las amistades de un usuario
export const getAmistadesPorUsuario = async (req: Request, res: Response) => {
    const {idUsuario} = req.params;
    try {
        const amistades = await AmistadModel.getAmistadesPorUsuario(Number(idUsuario));
        res.json(amistades);
    } catch (error) {
        console.error('Error al obtener amistades del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createAmistad = async (req: Request, res: Response) => {
    const idUsuario1 = req.userId;
    const idUsuario2 = Number(req.params.idUsuario2);

    const resultado = await AmistadService.crearAmistad(Number(idUsuario1), idUsuario2);

    if (resultado.valido) {
        res.status(201).json({ message: 'Amistad creada correctamente', amistad: resultado.mensaje });
    } else {
        res.status(400).json({ message: resultado.mensaje });
    }

};

//elimina una amistad por los ids de los usuarios
export const deleteAmistad = async (req: Request, res: Response) => {
    const usuarioId = req.userId;
    console.log('usuario en controller delete '+usuarioId);
    let todoBien = true;

    if (!usuarioId) {
        todoBien = false;
        return res.status(401).json({ message: 'El usuario no es correcto' });
    }

    const idUsuario2 = Number(req.params.idUsuario2);
    const usuario1 = await UsuarioService.existeUsuarioPorId(usuarioId);
    const usuario2 = await UsuarioService.existeUsuarioPorId(Number(idUsuario2));

    if (!usuario1 || !usuario2) {
        todoBien = false;
        return res.status(404).json({ message: 'Uno o ambos usuarios no existen' });
    }

    //no existe la amistad
    const amistadExistente = await AmistadService.existeAmistad(usuarioId, idUsuario2);
    if (!amistadExistente) {
        todoBien = false;
        return res.status(400).json({ message: 'La amistad no existe' });
    }

    if (todoBien) {
        try {
            const eliminado = await AmistadModel.eliminarAmistad(usuarioId, Number(idUsuario2));
            if (eliminado) {
                // Borra las solicitudes de amistad asociada si existe
                await SolicitudAmistadService.eliminarSolicitudesEntreUsuarios(idUsuario2, usuarioId);
                res.json({ message: 'Amistad eliminada correctamente' });
            } else {
                res.status(404).json({ message: 'no se ha podido eliminar la amistad' });
            }
        } catch (error) {
            console.error('Error al eliminar amistad:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
};