import { Router } from 'express';
import * as AmistadController from '../controllers/amistad.controller.js';

const router = Router();

// Obtener todas las amistades
router.get('/', AmistadController.getAmistades);

// Obtener amistades de un usuario
router.get('/usuario/:idUsuario', AmistadController.getAmistadesPorUsuario);

//crear una nueva amistad
router.post('/', AmistadController.createAmistad);

//borra una amistad por los ids de los usuarios
//http://localhost:3000/api/amistad/1/2
router.delete('/:idUsuario1/:idUsuario2', AmistadController.deleteAmistad);

export default router;