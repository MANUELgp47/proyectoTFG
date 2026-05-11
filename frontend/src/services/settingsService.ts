import api from "../api/axios";
import type {Settings} from "../types.ts";

export const getMySettings = async () => {
    const response = await api.get("/settings");
    return response.data;
}

export const getPrivacidad = async (idUsuario: number) => {
    const response = await api.get(`/settings/privacidad/${idUsuario}`);
    return response.data;
}

export const updateSettings = async (data: any) => {
    const response = await api.put("/settings", data);
    return response.data;
}


//bloquear usa getSettings y update settings con el id del usuario bloqueado
export const bloquear = async (id: number) => {
    const settings: Settings = await getMySettings();
    //añade el id a settings.usuarios_bloqueados
    const usuariosBloqueados = settings.usuariosBloqueados || [];
    if (!usuariosBloqueados.includes(id)) {
        usuariosBloqueados.push(id);
    }
    const response = await updateSettings({usuariosBloqueados: usuariosBloqueados});
    return response.data;
}

//desbloquear usa getSettings y update settings con el id del usuario bloqueado
export const desbloquear = async (id: number) => {
    const settings: Settings = await getMySettings();
    //elimina el id de settings.usuarios_bloqueados
    const usuariosBloqueados = settings.usuariosBloqueados || [];
    const index = usuariosBloqueados.indexOf(id);
    if (index > -1) {
        usuariosBloqueados.splice(index, 1);
    }
    const response = await updateSettings({usuariosBloqueados: usuariosBloqueados});
    return response.data;
}


//devuelve true si yo lo he bloqueado, false si no lo he bloqueado
export const getloHeBloqueado = async (idUsuario: number) => {
    const response = await api.get(`/settings/loHeBloqueado/${idUsuario}`);
    return response.data;
}

//true si el me ha bloqueado, false si no me ha bloqueado
export const getmeHaBloqueado = async (idUsuario: number) => {
    const response = await api.get(`/settings/meHaBloqueado/${idUsuario}`);
    return response.data;
}

//solicita codigo de verificacion al backend, el backend se encarga de enviarlo al correo del usuario
export const solicitarCodigoVerificacion = async () => {
    const response = await api.post("/settings/verificarCorreo");
    return response.data;
}

//enviar codigo de verificacion al backend
export const enviarCodigoVerificacion = async (codigo: string) => {
    const response = await api.post(`/settings/verificarCorreoCodigo/${codigo}`);
    return response.data;
}