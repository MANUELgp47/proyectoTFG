import api from "../api/axios";


//crea chat individual

export const crearRecuerdo = async (data: any) => {
    console.log("servicio" ,data);
    const response = await api.post(`/recuerdo/`, data);
    return response.data;
}

//obtener recuerdo por id de recuerdo
export const getRecuerdoPorId = async (id: number) => {
    const response = await api.get(`/recuerdo/${id}`);
    return response.data;
}

//obtener recuerdos por id de usuario
export const getRecuerdosPorUsuario = async (idUsuario: number) => {
    const response = await api.get(`/recuerdo/usuario/${idUsuario}`);
    return response.data;
}