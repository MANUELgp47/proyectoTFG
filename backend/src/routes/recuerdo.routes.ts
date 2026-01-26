import { Router } from 'express';
import * as RercuerdoController from '../controllers/recuerdo.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todos los recuerdos
router.get('/', RercuerdoController.getRecuerdos);

//crear una nuevo recuerdo
router.post('/',authMiddleware, RercuerdoController.createRecuerdo);

//eliminar una recuerdo por id
router.delete('/:id', authMiddleware, RercuerdoController.deleteRecuerdoPorId);


export default router;