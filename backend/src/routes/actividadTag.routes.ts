import { Router } from 'express';
import * as ActividadTagController from '../controllers/actividadTag.controller.js';

const router = Router();

//Obtener todos los tags
router.get('/', ActividadTagController.getTodosActividadTags);

export default router;
