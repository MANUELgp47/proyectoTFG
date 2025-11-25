export interface Amistad{
    idUsuario1: number;
    idUsuario2: number;
    fechaCreacion?: string; // timestamp ISO
}
export type CrearAmistad = Omit<Amistad, 'fechaCreacion'>;//fechaCreacion se genera automáticamente al crear la amistad