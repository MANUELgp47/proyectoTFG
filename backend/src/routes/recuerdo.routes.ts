import { Router } from 'express';
import * as RercuerdoController from '../controllers/recuerdo.controller.js';

const router = Router();

//Obtener todos los recuerdos
router.get('/', RercuerdoController.getRecuerdos);

//crear una nueva recuerdo
router.post('/', RercuerdoController.createRecuerdo);

//eliminar una recuerdo por id
router.delete('/:id', RercuerdoController.deleteRecuerdoPorId);


export default router;