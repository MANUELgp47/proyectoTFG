import api from "../api/axios";
import type {Tag} from '../types';

//TAG
export const getTags = async (): Promise<Tag[]> => {
    const response = await api.get('tag');
    return response.data;
};



//ActividadTag
//asigna un tag a una actividad
export const asignarTagActividad = async (idActividad: number, idTag: number): Promise<void> => {
    console.log("asignarTagActividad", {idActividad, idTag});
    const response = await api.post("/actividadtag/", {idActividad, idTag});
    return response.data;

};