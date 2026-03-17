import api from "../api/axios.ts";

export const CrearSolicitud= async (idReceptor: number): Promise<any> => {
    const response = await api.post(`solicitudAmistad/${idReceptor}`);
    return response.data;
};

//obtienes si hay una solicitud entre ambos
export const getSolicitudAmistad = async (idReceptor: number): Promise<any> => {
    const response = await api.get(`solicitudAmistad/entre/${idReceptor}`);
    return response.data;
}
//aceptar solicitud de amistad
export const aceptarSolicitudAmistad = async (idUsuarioEmisor: number): Promise<void> => {
    const data={estado: 'aceptada'}
    const response = await api.put(`solicitudAmistad/${idUsuarioEmisor}`, data);
    return response.data;
}

//rechazar solicitud de amistad
export const rechazarSolicitudAmistad = async (idUsuarioEmisor: number): Promise<void> => {
    await api.put(`solicitudAmistad/${idUsuarioEmisor}`, {estado: 'rechazada'});
}