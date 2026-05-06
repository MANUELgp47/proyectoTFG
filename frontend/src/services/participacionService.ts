import api from "../api/axios";

//obtener numero de participantes de una actividad
export const getNumeroParticipantes = async (id: number) => {
    const response = await api.get(`/participacion/actividad/${id}/numero`);
    return response.data;
};

//obtiene la participacion de un usuario en una actividad
export const getParticipacionPorId = async (idActividad: number) => {
    const response = await api.get(`/participacion/${idActividad}`);
    return response.data;
};

//obtiene todas las participaciones de una actividad
export const getParticipacionesPorActividad = async (idActividad: number) => {
    const response = await api.get(`/participacion/actividad/${idActividad}`);
    return response.data;
};

//obtiene participaciones aceptadas de una actividad
export const getParticipacionesAceptadasPorActividad = async (idActividad: number) => {
    const response = await api.get(`/participacion/actividad/${idActividad}/aceptadas`);
    return response.data;
};

//participar en una actividad
export const participarEnActividad = async (idActividad: number) => {
    const response = await api.post(`/participacion`, {idActividad});
    return response.data;
};

//aceptar participacion
export const aceptarParticipacion = async (idUsuario: number, idActividad: number) => {
    const response = await api.put(`/participacion`, {idUsuario, idActividad, aceptada: true});
    return response.data;
};

//rechazar participacion
export const rechazarParticipacion = async (idUsuario: number, idActividad: number) => {
    const response = await api.put(`/participacion`, {idUsuario, idActividad, aceptada: false});
     return response.data;
};

//eliminar participacion
export const eliminarParticipacion = async (idUsuario: number, idActividad: number) => {
    const response = await api.delete(`/participacion`, {data: {idUsuario, idActividad}}); //se pone data porque es un delete y no un post o put
    return response.data;
};