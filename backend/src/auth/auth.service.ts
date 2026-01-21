import * as UsuarioModel from '../models/usuario.model.js';
import * as bcrypt from 'bcrypt';
import {UsuarioService} from "../services/usuario.service.js";
import jwt from 'jsonwebtoken';


//TODO en este archivo se está ingnorando un rerror de jwt.sign

export class AuthService {
    /*
    Devuelve el id del usuario si la autenticación es exitosa, -1 si falla
     */
    static async login(nombre_email: string, contrasena: string): Promise<number> {
        try {
            //comprobar si es email o nombre de usuario y lo busca
            let usuario;
            if (nombre_email.includes('@')) {
                usuario = await UsuarioService.obtenerUsuarioPorEmail(nombre_email);
            } else {
                usuario = await UsuarioService.obtenerUsuarioPorNombreUsuario(nombre_email);
            }
            if (!usuario) {
              //  throw new Error('El usuario no existe');
                return -1; // Usuario no encontrado
            }
            //verificar la contraseña usando bcrypt
            if (!await bcrypt.compare(contrasena, usuario.contrasena)) {
             //   throw new Error('Contraseña o usuario incorrecta');
                return -1; // Contraseña incorrecta
            }
            return (usuario as any).idUsuario; // Autenticación exitosa
        } catch (error) {
            throw new Error('Error al autenticar el usuario');
        }
    }

    static generarToken(usuarioId: number): string {
      //  console.log('Generando token para usuario ID:', process.env.JWT_SECRET);
        const secretKey =  process.env.JWT_SECRET as string;
        const caducidad = { expiresIn: process.env.JWT_EXPIRES_IN };
        // @ts-ignore
        const token = jwt.sign({id: usuarioId}, secretKey, caducidad);
        return token;
    }
}