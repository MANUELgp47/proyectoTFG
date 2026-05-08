import api from './axios';

interface LoginRequest {
    nombre_email: string;
    contrasena: string;
}

interface LoginResponse {
    token: string;
}

export const login = async (token: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', token);

    return response.data;
};

interface RegisterRequest {
    nombreUsuario: string;
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    fechaNac: string;
    sexo: boolean;//opcional
    fotoPerfil: string; //opcional
    biografia: string;//opcional
    ubicacion: string;//opcional
    imagen: string;
}

export const register = async (data: RegisterRequest | FormData) => {
    const response = await api.post('/usuario', data);
    return response.data;
};
