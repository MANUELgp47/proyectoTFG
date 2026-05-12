import { Router } from 'express';
import * as ActividadController from '../controllers/actividad.controller.js';
import {finalizarActividad, getActividadesCreadasPorUsuario} from "../controllers/actividad.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";
import * as ActividadTagController from "../controllers/actividadTag.controller.js";
import { upload } from "../cloudinaryConfig.js";


const router = Router();

//Obtener todas las actividades
router.get('/', ActividadController.getActividades);

//Obtener actividades en las que participo un usuario
router.get('/misActividades', authMiddleware, ActividadController.getActividadesQueParticipo);

//Obtener los datos basicos de una actividad por ID
router.get('/:id/datosBasicos', authMiddleware, ActividadController.getDatosBasicosActividadPorId);

//Obtener una actividad por ID
router.get('/:id', authMiddleware, ActividadController.getActividadPorId);

//Obtener actividades creadas por un usuario
router.get('/usuario/:idUsuario', authMiddleware, ActividadController.getActividadesCreadasPorUsuario);

//Crear una nueva actividad
router.post('/', authMiddleware, upload.array('imagenes'), ActividadController.createActividad);

//Actualizar una actividad existente
router.put('/:id', authMiddleware, upload.array('imagenes'), ActividadController.updateActividad);

//Eliminar una actividad
router.delete('/:id', authMiddleware, ActividadController.deleteActividad);

//finalizar una actividad
router.post('/:id/finalizar', authMiddleware, ActividadController.finalizarActividad);

//cancelar una actividad
//router.post('/:id/cancelar', authMiddleware, ActividadController.cancelarActividad);
//obtener numero de actividades creadas por un usuario
router.get('/numero/:id/creadas', authMiddleware, ActividadController.getNumeroActividadesCreadas);


//edita admin
router.put('/admins/:idActividad',authMiddleware, ActividadController.editAdmins);

//edita expulsados
router.put('/expulsados/:idActividad',authMiddleware, ActividadController.editExpulsados);

export default router;