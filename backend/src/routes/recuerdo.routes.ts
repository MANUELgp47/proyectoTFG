import { Router } from 'express';
import * as RercuerdoController from '../controllers/recuerdo.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todos los recuerdos
router.get('/', RercuerdoController.getRecuerdos);

//Obtener un recuerdo por ID
router.get('/:id', authMiddleware, RercuerdoController.getRecuerdoPorId);

//Obtener recuerdos creados por un usuario
router.get('/usuario/:idUsuario', authMiddleware, RercuerdoController.getRecuerdosPorUsuario);

//crear una nuevo recuerdo
router.post('/',authMiddleware, RercuerdoController.createRecuerdo);

//eliminar una recuerdo por id
router.delete('/:id', authMiddleware, RercuerdoController.deleteRecuerdoPorId);


export default router;