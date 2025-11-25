export interface Recuerdo {
    idRecuerdo: number;
    idUsuario: number;
    idActividad?: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion?: string; // timestamp ISO
    imagenes?: string[]; // Array de URLs o rutas de las imágenes
}

export type CrearRecuerdo = Omit<Recuerdo, 'idRecuerdo' | 'fechaCreacion'>;
