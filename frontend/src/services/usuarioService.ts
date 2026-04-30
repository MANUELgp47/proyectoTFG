
import api from "../api/axios";


export const getUsuario = async (id: number): Promise<any> => {
    const response = await api.get(`/usuario/${id}`);
    return response.data;
};

//actualizar usuario
export const updateUsuario = async (usuarioData: any): Promise<any> => {
    const response = await api.put(`/usuario/`, usuarioData);
    return response.data;
};

//obtener datos minimos de usuario por id
export const getDatosMinimosUsuario = async (idUsuario: number): Promise<any> => {
    const response = await api.get(`/usuario/${idUsuario}/datosMinimos`);
    return response.data;
};


