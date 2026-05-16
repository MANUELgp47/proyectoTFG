import { Router } from 'express';
import * as UsuarioController from '../controllers/usuario.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";
import {upload} from "../cloudinaryConfig.js";

const router = Router();


//busqueda por nombre
router.get('/buscar', authMiddleware, UsuarioController.buscarUsuariosNombre);

//Obtener un usuario por id
router.get('/:idUsuario', authMiddleware, UsuarioController.getUsuarioID);

//Obtener todos los usuarios
router.get('/', UsuarioController.getUsuarios);

//Crear un nuevo usuario
router.post('/', upload.array('imagen'), UsuarioController.createUsuario);

//obtiene los datos minimos de usuario por id {idUsuario, nombreUsuario}
router.get('/:idUsuario/datosMinimos', authMiddleware, UsuarioController.getDatosMinimosUsuarioID);

//Obtener el perfil de un usuario por id
router.get('/perfil/:idUsuario', authMiddleware, UsuarioController.getPerfilUsuarioID);

//Actualizar ultima conexion del usuario
router.put('/ultimaConexion', authMiddleware, UsuarioController.actualizarUltimaConexion);

//Actualizar un usuario existente
//router.put('/:id', UsuarioController.updateUsuario);
router.put('/', authMiddleware, upload.array('imagen'),UsuarioController.updateUsuario);

//eliminar un usuario
router.delete('/', authMiddleware, UsuarioController.deleteUsuario);

//banear usuario Cambia su rol a baneado //post para
router.put('/baneo/:idUsuario', authMiddleware, UsuarioController.banearUsuario);

/*
export const buscarUsuarios = async (nombre: string): Promise<any> => {
    const response = await api.get(`/usuario?nombre=${encodeURIComponent(nombre)}`);
    return response.data;
};
* */

//Buscar usuarios por nombre
//router.get('/', authMiddleware, UsuarioController.buscarUsuariosPorNombre);

export default router;
