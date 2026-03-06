import { Router } from 'express';
import * as UsuarioController from '../controllers/usuario.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener un usuario por id
router.get('/:idUsuario', authMiddleware, UsuarioController.getUsuarioID);

//Obtener todos los usuarios
router.get('/', UsuarioController.getUsuarios);

//Crear un nuevo usuario
router.post('/', UsuarioController.createUsuario);

//Actualizar un usuario existente
//router.put('/:id', UsuarioController.updateUsuario);
router.put('/', authMiddleware, UsuarioController.updateUsuario);

//eliminar un usuario
router.delete('/', authMiddleware, UsuarioController.deleteUsuario);


export default router;
