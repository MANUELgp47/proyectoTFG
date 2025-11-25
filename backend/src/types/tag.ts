export interface Tag {
    idTag: number;
    nombre: string;
}

export type CrearTag = Omit<Tag, 'idTag'>;