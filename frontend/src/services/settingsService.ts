import api from "../api/axios";

export const getMySettings = async () => {
    const response = await api.get("/settings");
    return response.data;
}

export const getPrivacidad = async (idUsuario:number) => {
    const response = await api.get(`/settings/privacidad/${idUsuario}`);
    return response.data;
}

export const updateSettings = async (data: any) => {
    const response = await api.put("/settings", data);
    return response.data;
}