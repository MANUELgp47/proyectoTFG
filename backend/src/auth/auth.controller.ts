import * as AuthService from './auth.service.js';
import type {Request, Response} from 'express';
import {UsuarioService} from "../services/usuario.service.js";

export const login = async (req: Request, res: Response) => {
    try {
        const {nombre_email, contrasena} = req.body;
        if (!nombre_email || !contrasena) {
            return res.status(400).json({message: 'Nombre de usuario/email y contraseña son requeridos'});
        }
        const exito = await AuthService.AuthService.login(nombre_email, contrasena);

        if (exito) {
            console.log({message: 'Autenticación exitosa'});
           // res.status()
            const token = AuthService.AuthService.generarToken(exito);
             res.json(token);



        } else {
            return res.status(401).json({message: 'Usuario o contraseña incorrecta'});
        }
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({message: 'Error del servidor'});
        throw new Error('Error al autenticar el usuario');
    }
}