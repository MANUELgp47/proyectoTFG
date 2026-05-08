import * as SettingsModel from '../models/settings.model.js';
import {hayBloqueo} from "../models/settings.model.js";

export class SettingsService {

    //hay algun bloqueo entre dos usuarios
    static async hayBloqueoEntreUsuarios(idUsuario1: number, idUsuario2: number): Promise<boolean | undefined> {
        try {
            const resultado:boolean = await SettingsModel.hayBloqueo(idUsuario1, idUsuario2);
            return resultado;
        }catch (error) {
            console.error('Error al verificar bloqueo entre usuarios:', error);
        }
    }
}
