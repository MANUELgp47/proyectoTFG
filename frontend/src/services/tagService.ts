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
export const crearTag = async (tag: { nombre: string }): Promise<Tag> => {
    const response = await api.post("/tag/", tag);
    return response.data;
};

//elimina un tag
export const eliminarTag = async (idTag: number): Promise<void> => {
    const response = await api.delete(`/tag/${idTag}`);
    return response.data;
};