import { Router } from 'express';
import * as TagController from '../controllers/tag.controller.js';
import {getTagsByActividad} from "../controllers/tag.controller.js";
import {upload} from "../cloudinaryConfig.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todos los tags
router.get('/',TagController.getTags);

//Obtener los tags de una actividad
router.get('/actividad/:idActividad',TagController.getTagsByActividad);

//Crear un nuevo tag
router.post('/',authMiddleware , upload.array('imagen'), TagController.createTag);

//Eliminar un tag por id
router.delete('/:idTag',TagController.deleteTag);


export default router;
