import api from "../api/axios";

export const getNotificaciones = async () => {
    const response = await api.get("/notificacion/mias");
    return response.data;
};

//get not por id
export const getNotificacionPorId = async (idNotificacion: number) => {
    const response = await api.get(`/notificacion/${idNotificacion}`);
    return response.data;
}

//marca como leida una notificacion
export const marcarNotificacionComoLeida = async (idNotificacion: number) => {
    const response = await api.put(`/notificacion/${idNotificacion}`, {leida: true});
    return response.data;
};

//eliminar notificacion
export const eliminarNotificacion = async (idNotificacion: number) => {
    const response = await api.delete(`/notificacion/${idNotificacion}`);
    return response.data;
};

//crear denuncia
export const crearDenuncia = async (idUsuarioEmisor: number, tipo: string, idReferencia: number, mensaje: string) => {
    const response = await api.post("/notificacion/denuncia", {
        idUsuarioEmisor,
        idReferencia,
        mensaje,
        tipo
    });
    return response.data;
}