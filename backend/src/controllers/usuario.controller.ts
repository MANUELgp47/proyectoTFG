import type {Request, Response} from 'express';
import * as UsuarioModel from '../models/usuario.model.js';
import * as UsuarioService from '../services/usuario.service.js';
import * as SettingsModel from '../models/settings.model.js';
import {getSettings} from "../models/settings.model.js";
import {NotificacionService} from "../services/notificacion.service.js";

const extractErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        return (err as any).message;
    }
    return 'Error del servidor';
};

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
        console.log("perfil usuario", req.params.idUsuario);
        const idParam = req.params.idUsuario;
        if (!idParam) {
            return res.status(400).json({message: 'ID requerido'});
        }
        const idUsuario = parseInt(idParam, 10);
        if (Number.isNaN(idUsuario)) {
            return res.status(400).json({message: 'ID inválido'});
        }

        const settings = await SettingsModel.getSettings(idUsuario);

        //el consultor es admin o mod
        let consultorPrivilegiado = false;
        const rolConsultor = await UsuarioService.UsuarioService.getRolPorIdUsuario(Number(req.userId));
        if (rolConsultor === 'admin' || rolConsultor === 'mod') {
            consultorPrivilegiado = true;
        }

        if (settings?.perfilPublico || req.userId === idUsuario || consultorPrivilegiado ) {
            const perfil = await UsuarioService.UsuarioService.obtenerUsuarioPorId(idUsuario);
            res.json(perfil);
        } else if (settings) {
            const perfil = await UsuarioService.UsuarioService.obtenerDatosMinimosUsuarioPorId(idUsuario);
            res.json(perfil);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
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
        //imagen sola
        const nuevoArchivo = (req.file as any) ?? ((req.files as any[])?.[0]) ?? null;
        const rutaImg = nuevoArchivo?.path ?? "";
        // console.log("Ruta imagen ", rutaImg);
        if (rutaImg) {
            req.body.imagen = rutaImg;
        } else {
            req.body.imagen = null;
        }


        const usuario = await UsuarioService.UsuarioService.crearUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        //muestra el body del error en la consola del servidor
        console.log(req.body)
        const msg = extractErrorMessage(error);
        res.status(400).json({message: msg});
    }
};

//actualizar ultima conexion del usuario
export const actualizarUltimaConexion = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.userId;
        if (!idUsuario) {
            return res.status(400).json({message: 'ID requerido'});
        }

        const usuarioActualizado = await UsuarioModel.actualizarUltimaConexion(idUsuario);
        if (usuarioActualizado) {
            res.json({message: 'Última conexión actualizada'});
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        console.error('Error al actualizar última conexión:', error);
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

        //si quiere cambiar su nombre de usuario, verifica que el nuevo nombre de usuario no esté ya en uso por otro usuario
        if (req.body.nombreUsuario) {
            const usuarioConNombre = await UsuarioModel.getUsuarioPorNombreUsuario(req.body.nombreUsuario);
            if (usuarioConNombre && usuarioConNombre.idUsuario !== req.userId) {//si el nombre de usuario ya está en uso por otro usuario que no soy yo, devuelve un error
                throw new Error('El nombre de usuario ya está en uso');
            }
        }


        //imagen sola
        const nuevoArchivo = (req.file as any) ?? ((req.files as any[])?.[0]) ?? null;
        const rutaImg = nuevoArchivo?.path ?? "";
        const usuarioExistente = await UsuarioService.UsuarioService.obtenerUsuarioPorId(req.userId);
        let nuevasRutas: string = "";
        console.log("rutaImg:", rutaImg, "usuario.imagen:", usuarioExistente?.imagen);
        if (rutaImg) {
            nuevasRutas = rutaImg;
        } else if (usuarioExistente && usuarioExistente.imagen) {
            nuevasRutas = usuarioExistente.imagen;
        }
        req.body.imagen = nuevasRutas;


        const usuarioActualizado = await UsuarioModel.actualizarUsuario(req.userId, req.body);
        if (usuarioActualizado) {
            //TODO. Notificar al usuario que su perfil ha sido actualizado
            res.json(usuarioActualizado);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        const msg = extractErrorMessage(error);
        res.status(400).json({message: msg});
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

//busca todos los usuarios con la cadena de caracteres que se le pasó
export const buscarUsuariosNombre = async (req: Request, res: Response) => {
    try {

        //soy un usuario existente
        const idUsuario = req.userId;
        const usuarioExistente = await UsuarioService.UsuarioService.obtenerUsuarioPorId(Number(idUsuario));
        if (!usuarioExistente) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        const nombre = req.query.nombre as string;
        if (!nombre) {
            return res.status(400).json({message: 'Nombre requerido'});
        }

        const usuarios = await UsuarioService.UsuarioService.buscarUsuariosPorNombre(nombre);
        res.json(usuarios);

    } catch (error) {
        console.error('Error al buscar usuarios por nombre:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
}

//banea o desbanea un usuario cambiando su rol a baneado o usuario
export const banearUsuario = async (req: Request, res: Response) => {
    try {
        const idParam = Number(req.params.idUsuario);
        const idAdmin = Number(req.userId);

        console.log("idParam", idParam, "idAdmin", idAdmin);
        console.log("body ", req.body);

        //verifica que idUsuario e idAdmin son distintos
        if (idParam === idAdmin) {
            return res.status(400).json({message: 'No puedes banearte a ti mismo'});
        }

        //verifica que el idAdmin es un administrador
        const esAdmin = await UsuarioService.UsuarioService.getRolPorIdUsuario(Number(idAdmin));
        if (esAdmin !== 'admin') {
            return res.status(403).json({message: 'No tienes permiso para banear usuarios'});
        }

//verifica que el usuario existente

        if (Number.isNaN(idParam)) {
            return res.status(400).json({message: 'ID inválido'});
        }
        const usuarioExistente = await UsuarioService.UsuarioService.obtenerUsuarioPorId(idParam);
        if (!usuarioExistente) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }


//Comprueba si quiere banear(req.body.action= add) o desbanear(*=remove) al usuario.

        const action = req.body.action;

        //realiza la acción de banear o desbanear al usuario si el usuario no tiene ya el rol de baneado o user respectivamente
        const rolUser = await UsuarioService.UsuarioService.getRolPorIdUsuario(idParam);
        let exito = false;
        if (action === 'add' && rolUser !== 'baneado') {
            const respuesta = await UsuarioModel.cambiarRolUsuario(idParam, 'baneado');
            if (respuesta) {
                exito = true;
            }
            res.json({message: 'Usuario baneado correctamente'});

        } else if (action === 'remove' && rolUser === 'baneado') {
            const respuesta = await UsuarioModel.cambiarRolUsuario(idParam, 'user');
            if (respuesta) {
                exito = true;
            }
            res.json({message: 'Usuario desbaneado correctamente'});
        } else {
            res.status(400).json({message: 'Acción inválida o usuario ya tiene el rol correspondiente'});
        }

        // si se hace el cambio de rol, notifica al usuario que ha sido baneado o desbaneado
        if (exito) {
            //TODO añadir nuvo tipo de notificación. Uso solicitud_amistad por el momento
            await NotificacionService.creaNotificacionPorParametros(idParam, 'otro', action === 'add' ? 'Has sido baneado por un administrador' : 'Has sido desbaneado por un administrador', 0);
        }

    } catch (error) {
        console.error('Error al banear/desbanear usuario:', error);
    }
}
