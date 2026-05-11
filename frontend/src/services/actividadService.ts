import api from "../api/axios";

export const getActividades = async () => {
    const response = await api.get("/actividad");
    return response.data;
};
export const getActividadesFiltro = async (data:any ) => {
    const response = await api.get(`/actividad?${data}`);
    return response.data;
};

export const createActividad = async (data: FormData) => {
    const response = await api.post("/actividad", data);
    return response.data;
};

//obtener una actividad por id
export const getActividadPorId = async (id: number) => {
    const response = await api.get(`/actividad/${id}`);
    return response.data;
};

//obtener las actividades creadas por un usuario
export const getActividadesPorUsuario = async (id: number) => {
    const response = await api.get(`/actividad/usuario/${id}`);
    return response.data;
};

export const updateActividad = async (id: number, data: FormData) => {
    // Axios se encarga de poner el 'Content-Type': 'multipart/form-data' automáticamente
    const response = await api.put(`/actividad/${id}`, data);
    return response.data;
};

//Finaliza una actividad
export const finalizarActividad = async (id: number) => {
    const response = await api.post(`/actividad/${id}/finalizar`);
    return response.data;
};

//obtener los participantes de una actividad
export const getActividadesQueParticipo = async () => {
    //obtengo mis participaciones
    const response = await api.get("/actividad/misActividades");


    return response.data;
};

//edita admin
export const addAdmin = async (idActividad: number, idAdmin: number) => {
    const action = "add";
    const response = await api.put(`/actividad/admins/${idActividad}`, {idAdmin, action});
    return response.data;
};
export const removeAdmin = async (idActividad: number, idAdmin: number) => {
    const action = "remove";
    const response = await api.put(`/actividad/admins/${idActividad}`, {idAdmin, action});
    return response.data;
};

//edita expulsados
export const addExpulsado = async (idActividad: number, idExpulsado: number) => {
    const action = "add";
    const response = await api.put(`/actividad/expulsados/${idActividad}`, {idExpulsado, action});
    return response.data;
}

export const removeExpulsado = async (idActividad: number, idExpulsado: number) => {
    const action = "remove";
    const response = await api.put(`/actividad/expulsados/${idActividad}`, {idExpulsado, action});
    return response.data;
};

//datos basicos de una actividad por id
export const getDatosMinimosActividadPorId = async (id: number) => {
    const response = await api.get(`/actividad/${id}/datosBasicos`);
    return response.data;
};



//ADMINISTRACIÓN
//Elimina una actividad por id (sólo admin y moderador)
export const eliminarActividad = async (id: number) => {
    const response = await api.delete(`/actividad/${id}`);
    return response.data;
};
