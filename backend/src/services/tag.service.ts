import * as TagModel from '../models/tag.model.js';

export class TagService {

    static async getTagById(idTag: number) {
        return await TagModel.getTagPorId(idTag);
    }

    //existe un tag por nombre
    static async existeTagPorNombre(nombre: string) : Promise<boolean> {
        const tag = await TagModel.getTagPorNombre(nombre);
        return tag !== null;
    }

    //existe un tag por id
    static async existeTagPorid(idTag: number) : Promise<boolean> {
        const tag = await TagModel.getTagPorId(idTag);
        return tag !== null;
    }
}