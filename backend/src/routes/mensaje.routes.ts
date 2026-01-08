import { Router } from 'express';
import * as MensajeController from '../controllers/mensaje.controller.js';

const router = Router();

// ver todos los mensajes
router.get('/', MensajeController.getMensajes);

//crear un mensaje
router.post('/', MensajeController.createMensaje);


//eliminar un mensaje por id
router.delete('/:id', MensajeController.deleteMensaje);

//actualizar un mensaje por id TODO: implementar en el controlador
router.put('/:id', MensajeController.updateMensaje);


export default router;