import api from "../api/axios";
import type {Tag} from '../types';

//TAG
export const getTags = async (): Promise<Tag[]> => {
    const response = await api.get('tag');
    return response.data;
};


//obtiene los tags de una actividad
export const getTagsActividad = async (idActividad: number): Promise<Tag[]> => {
    const response = await api.get(`/tag/actividad/${idActividad}`);
    return response.data;
};

//ActividadTag
//asigna un tag a una actividad
export const asignarTagActividad = async (idActividad: number, idTag: number): Promise<void> => {
    console.log("asignarTagActividad", {idActividad, idTag});
    const response = await api.post("/actividadtag/", {idActividad, idTag});
    return response.data;

};

//elimina un tag de una actividad
export const eliminarTagActividad = async (idActividad: number, idTag: number): Promise<void> => {
    console.log("eliminarTagActividad", {idActividad, idTag});
    const response = await api.delete("/actividadtag/", { data: { idActividad, idTag } });
    return response.data;
};



//ADMINISTRADOR
//crea un nuevo tag
export const crearTag = async (data: FormData) => {
    const response = await api.post("/tag/", data);
    return response.data;
};



/*
*
export async function crearTag(payload: { nombre: string } | FormData) {
    if (payload instanceof FormData) {
        const res = await fetch(`${API_BASE}/tags`, {
            method: 'POST',
            body: payload // multipart/form-data; browser añade el boundary
        });
        if (!res.ok) throw new Error('Error creando tag con imagen');
        return res.json();
    } else {
        const res = await fetch(`${API_BASE}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error creando tag');
        return res.json();
    }
}
* */

//elimina un tag
export const eliminarTag = async (idTag: number): Promise<void> => {
    const response = await api.delete(`/tag/${idTag}`);
    return response.data;
};