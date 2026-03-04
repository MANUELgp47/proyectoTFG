import api from "../api/axios";

export const getActividades = async () => {
    const response = await api.get("/actividad");
    return response.data;
};

export const createActividad = async (data: any) => {
    const response = await api.post("/actividad", data);
    return response.data;
};

//obtener una actividad por id
export const getActividadPorId = async (id: number) => {
    const response = await api.get(`/actividad/${id}`);
    return response.data;
};

export const getActividadesPorUsuario = async (id: number) => {
    const response = await api.get(`/actividad/usuario/${id}`);
    return response.data;
};

export const updateActividad = async (id: number, data: any) => {
    const response = await api.put(`/actividad/${id}`, data);
    return response.data;
};

//cancelar actividad


//obtener los participantes de una actividad
export const getActividadesQueParticipo = async () => {
    //obtengo mis participaciones
    const response = await api.get("/actividad/misActividades");


    return response.data;
};
