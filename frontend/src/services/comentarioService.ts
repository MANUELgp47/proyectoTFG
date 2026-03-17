import api from "../api/axios";

export const getComentarioByIdRecuerdo = async (idRecuerdo: number) => {
    const response = await api.get(`/comentario/recuerdo/${idRecuerdo}`);
    return response.data;
}

export const crearComentario = async (data: any) => {
    console.log(data);
    const response = await api.post("/comentario/", data);
    return response.data;
}

export const eliminarComentario = async (idComentario: number) => {
    const response = await api.delete(`/comentario/${idComentario}`);
    return response.data;
}