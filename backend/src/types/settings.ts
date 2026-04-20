export interface Settings {
    idUsuario: number;
    perfilPublico: boolean;
    actividadPublica: boolean;
    modoOscuro: boolean;
    idioma: string; // e.g., 'es', 'en', etc.
    preferencias: number[]; // Array de IDs de preferencias
    usuariosBloqueados: number[]; // Array de IDs de usuarios bloqueados
}
export type CreaSettings = Omit<Settings, 'id_usuario'>;