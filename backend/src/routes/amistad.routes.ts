import { Router } from 'express';
import * as AmistadController from '../controllers/amistad.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";
import {getAmistadPorUsuarios} from "../controllers/amistad.controller.js";

const router = Router();

// Obtener todas las amistades
router.get('/', AmistadController.getAmistades);

// Obtener amistades de un usuario
router.get('/usuario/:idUsuario', AmistadController.getAmistadesPorUsuario);

// Obtener amistad entre dos usuarios
router.get('/entre/:idUsuario1/:idUsuario2', AmistadController.getAmistadPorUsuarios);

//crear una nueva amistad TODO: Ver si solo se tiene acceso si se acepta una solicitud de amistad
router.post('/:idUsuario2', authMiddleware, AmistadController.createAmistad);

//borra una amistad por los ids de los usuarios
//http://localhost:3000/api/amistad/1/2
router.delete('/:idUsuario2',authMiddleware, AmistadController.deleteAmistad);

export default router;