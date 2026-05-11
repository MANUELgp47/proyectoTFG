export interface Tag {
    idTag: number;
    nombre: string;
    imagen?: string;
}

export type CrearTag = Omit<Tag, 'idTag'>;