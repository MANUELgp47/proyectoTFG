import api from "../api/axios";

export const getLikesByIdRecuerdo = async (idRecuerdo: number) => {
    const response = await api.get(`/likeMegusta/recuerdo/numero/${idRecuerdo}`);
    return response.data;
}
export const getLikesByIdComentario = async (idComentario: number) => {
    const response = await api.get(`/likeMegusta/comentario/numero/${idComentario}`);
    return response.data;
}

export const crearLike = async (data: any) => {
    const response = await api.post("/likeMegusta/", data);
    return response.data;
}

export const usuarioDioLikeRecuerdo = async ( idRecuerdo: number) => {
    const response = await api.get(`/likeMegusta/recuerdo/${idRecuerdo}`);
    if (response.data) {
        return true;
    }
    return false;

}
export const usuarioDioLikeComnetario = async ( idComentario: number) => {
    const response = await api.get(`/likeMegusta/comentario/${idComentario}`);
    if (response.data) {
        return true;
    }
    return false;
}