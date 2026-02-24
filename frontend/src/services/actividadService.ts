import api from "../api/axios";

export const getActividades = async () => {
    const response = await api.get("/actividad");
    return response.data;
};

export const createActividad = async (data: any) => {
    const response = await api.post("/actividad", data);
    return response.data;
};

