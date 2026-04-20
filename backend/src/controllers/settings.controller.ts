import type {Settings, CreaSettings} from "../types/settings.js";
import type {Request, Response} from 'express';
import * as SettingsModel from "../models/settings.model.js";
import {UsuarioService} from "../services/usuario.service.js";


export const getMySettings = async (req: Request, res: Response) => {
    const idUsuario = req.userId;

    //el id esta bien
    if (!idUsuario) {
        return res.status(400).json({message: "User ID is required"});
    }

    //el user existe
    const existeUsuario = await UsuarioService.existeUsuarioPorId(idUsuario);
    if (!existeUsuario) {
        return res.status(404).json({message: "User not found"});
    }
    try {
        const settings = await SettingsModel.getSettings(Number(idUsuario));
        if (!settings) {
            return res.status(404).json({message: "Settings not found"});
        }
        res.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
    }

}

//obtiene la privacidad de un usuario pasado por parametros
export const getMyPrivacy = async (req: Request, res: Response) => {
    const idUsuario = Number(req.params.idUsuario);

    //el id esta bien
    if (!idUsuario) {
        return res.status(400).json({message: "User ID is required"});
    }

    //el user existe
    const existeUsuario = await UsuarioService.existeUsuarioPorId(idUsuario);
    if (!existeUsuario) {
        return res.status(404).json({message: "User not found"});
    }

    try {
        //obtiene los datos de settings y devuelve solo la privacidadperfil
        // Publico: boolean;
        // actividadPublica: boolean;
        const settings = await SettingsModel.getSettings(idUsuario);
        if (!settings) {
            return res.status(404).json({message: "Settings not found"});
        }
        res.json({
            perfilPublico: settings.perfilPublico,
            actividadPublica: settings.actividadPublica
        });
    }catch (error) {
        console.error("Error fetching settings:", error);
    }

}


//actualiza los settings de un usuario
export const actualizarSettings = async (req: Request, res: Response) => {
    const idUsuario = req.userId;
    const settingsData: Partial<CreaSettings> = req.body;

    //el id esta bien
    if (!idUsuario) {
        return res.status(400).json({message: "User ID is required"});
    }

    //el user existe
    const existeUsuario = await UsuarioService.existeUsuarioPorId(idUsuario);
    if (!existeUsuario) {
        return res.status(404).json({message: "User not found"});
    }

    try {
        const updatedSettings = await SettingsModel.actualizarSettings(Number(idUsuario), settingsData);
        if (!updatedSettings) {
            return res.status(404).json({message: "Settings not found"});
        }
        res.json(updatedSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
    }
}