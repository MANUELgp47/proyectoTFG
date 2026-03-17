
import api from "../api/axios";


export const getAmistades = async (idUsuario: number): Promise<any> => {
    const response = await api.get(`amistad/usuario/${idUsuario}`);
    return response.data;
};

//devuelve amistades entre dos usuarios, si no hay amistad devuelve null
export const getAmistadEntreUsuarios = async (idUsuario1: number, idUsuario2: number): Promise<any> => {
    const response = await api.get(`amistad/entre/${idUsuario1}/${idUsuario2}`);
    return response.data;
};

//elimina amistad
export const eliminarAmistad = async (idusuario2: number): Promise<void> => {
    const response = await api.delete(`amistad/${idusuario2}`);
    return response.data;
}


//