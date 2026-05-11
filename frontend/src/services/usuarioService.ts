
import api from "../api/axios";


export const getUsuario = async (id: number): Promise<any> => {
    const response = await api.get(`/usuario/${id}`);
    return response.data;
};

//obtiene el perfil de un usuario por su id
export const getPerfilUsuario = async (idUsuario: number): Promise<any> => {
   // console.log("obteniendo perfil de usuario con id:", idUsuario);
    const response = await api.get(`/usuario/perfil/${idUsuario}`);
    //console.log("respuesta del servidor:", response.data);
    return response.data;
};

//actualizar usuario
export const updateUsuario = async (usuarioData: FormData) => {
    const response = await api.put(`/usuario/`, usuarioData);
    return response.data;
};

//obtener datos minimos de usuario por id
export const getDatosMinimosUsuario = async (idUsuario: number): Promise<any> => {
    const response = await api.get(`/usuario/${idUsuario}/datosMinimos`);
    return response.data;
};

//obtiene la lista de usuariosMinimos con el nombreUsuario igual que la cadena enviada.
export const buscarUsuariosNombre = async (nombre: string): Promise<any> => {
    const response = await api.get(`/usuario/buscar?nombre=${encodeURIComponent(nombre)}`);
    return response.data;
};

//actualiza ultima conexion del usuario
export const actualizarUltimaConexion = async (): Promise<any> => {
    const response = await api.put(`/usuario/ultimaConexion`);
    return response.data;
};


