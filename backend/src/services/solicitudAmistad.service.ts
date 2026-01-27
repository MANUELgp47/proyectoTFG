import type {SolicitudAmistad} from "../types/solicitudAmistad.js";
import * as SolicitudAmistadModel from '../models/solicitudAmistad.model.js';

export class SolicitudAmistadService {
    //eliminar una solicitud de amistad
    static async eliminarSolicitudAmistad(idEmisor: number, idReceptor: number): Promise<boolean> {
        try {
            const resultado = await SolicitudAmistadModel.eliminarSolicitudAmistad(idEmisor, idReceptor);
            return resultado;
        } catch (error) {
            console.error('Error al eliminar solicitud de amistad:', error);
            return false;
        }

    }
    //elimina las solicitudes entre dos usuarios
    static async eliminarSolicitudesEntreUsuarios(idUsuario1: number, idUsuario2: number): Promise<void> {
        await SolicitudAmistadModel.eliminarSolicitudAmistad(idUsuario1, idUsuario2);
        await SolicitudAmistadModel.eliminarSolicitudAmistad(idUsuario2, idUsuario1);
    }
}