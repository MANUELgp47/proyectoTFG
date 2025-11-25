import { Router } from 'express';
import * as UsuarioController from '../controllers/usuario.controller.js';

const router = Router();

//Obtener todos los usuarios
router.get('/', UsuarioController.getUsuarios);

//Crear un nuevo usuario
router.post('/', UsuarioController.createUsuario);

//Actualizar un usuario existente
//http://localhost:3000/api/usuarios/NUMERO_ID
router.put('/:id', UsuarioController.updateUsuario);

//eliminar un usuario
router.delete('/:id', UsuarioController.deleteUsuario);


export default router;
