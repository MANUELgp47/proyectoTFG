import type {Settings, CreaSettings} from "../types/settings.js";
import type {Request, Response} from 'express';
import * as SettingsModel from "../models/settings.model.js";
import {UsuarioService} from "../services/usuario.service.js";
import * as EmailService from "../services/emailService.js";
import type {Usuario} from "../types/usuario.js";
import * as CodigoVerificacionModel from "../models/codigoVerificacion.model.js";


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
    } catch (error) {
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

    //compruebo que no bloqueo 2 veces al mismo usuario y que no me bloqueo a mi mismo
    if (settingsData.usuariosBloqueados) {
        const uniqueBloqueados = Array.from(new Set(settingsData.usuariosBloqueados));
        if (uniqueBloqueados.length !== settingsData.usuariosBloqueados.length) {
            return res.status(400).json({message: "Usuarios bloqueados no pueden contener duplicados"});
        }
        if (settingsData.usuariosBloqueados.includes(idUsuario)) {
            return res.status(400).json({message: "no puedes bloquearte a ti mismo"});
        }
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

//lo he bloqueado?
export const getloHeBloqueado = async (req: Request, res: Response) => {
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
        const settings = await SettingsModel.getSettings(Number(req.userId));
        if (!settings) {
            return res.status(404).json({message: "Settings not found"});
        }
        const loHeBloqueado = settings.usuariosBloqueados?.includes(idUsuario) || false;
        res.json(loHeBloqueado);
    } catch (error) {
        console.error("Error fetching settings:", error);
    }
}

//me ha bloqueado?
export const getmeHaBloqueado = async (req: Request, res: Response) => {
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
        const settings = await SettingsModel.getSettings(idUsuario);
        if (!settings) {
            return res.status(404).json({message: "Settings not found"});
        }
        const meHaBloqueado = settings.usuariosBloqueados?.includes(Number(req.userId)) || false;
        res.json(meHaBloqueado);
    } catch (error) {
        console.error("Error fetching settings:", error);
    }
}

//verificar correo solicitud (Este es el que envia el correo con el codigo de verificacion)
export const verificarCorreo = async (req: Request, res: Response) => {
    //este endpoint se encarga de enviar el correo con el codigo de verificacion
    //recibe el email por body

    //get user
    const user = await UsuarioService.obtenerUsuarioPorId(Number(req.userId));

    if (!user?.email) {
        return res.status(404).json({message: "User not found"});
    }


    const email = user.email;


    try {
        //generar codigo de verificacion
        const codigo = Math.floor(100000 + Math.random() * 900000).toString(); //codigo de 6 digitos

        //enviar correo con el codigo de verificacion
        const resultado = await EmailService.enviarCodigoVerificacion(email, codigo);
        if (!resultado.success) {
            return res.status(500).json({message: "Error sending verification email", error: resultado.error});
        }

        //guardar el codigo de verificacion en la base de datos con una expiracion de 10 minutos
        await CodigoVerificacionModel.setCodigo(Number(req.userId), codigo);


        res.json({success:true,message: "Verification email sent successfully"});
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({message: "Error sending verification email", error});
    }
}

//recibe codigo de verificacion y lo verifica
export const verificarCorreoCodig = async (req: Request, res: Response) => {
    try {
        //console.log("Verificando correo");
        const codigo = req.params.codigo;
        //obtiene el codigo de verificacion de la base de datos y lo compara
        const codigoVerificacion = await CodigoVerificacionModel.getCodigoVerificacion(Number(req.userId));
        if (!codigoVerificacion) {
            return res.status(404).json({message: "Verification code not found"});
        }
        if (codigoVerificacion.codigo !== codigo) {
            return res.status(400).json({message: "Invalid verification code"});
        }

        //obtener la fecha actual y la del codigo de verificacion, si han pasado mas de 10 minutos, el codigo es invalido
        const fechaActual = new Date();
        const fechaCodigo = new Date(codigoVerificacion.fecha_codigo);
        const diferenciaMinutos = (fechaActual.getTime() - fechaCodigo.getTime()) / 1000 / 60;
        if (diferenciaMinutos > 10) {
            return res.status(400).json({message: "Verification code expired"});
        }

        //si tod0 lo demás está correcto se verifica
        await UsuarioService.verificarUsuario(Number(req.userId));

        res.json({success:true, message: "Email verified successfully"});


    } catch (error) {
        console.error("Error verifying code:", error);
        res.status(500).json({message: "Error verifying code", error});
    }
}
