/**
 * Representación del usuario dentro del código (tipos usados en toda la app).
 * Nota: en la BD los campos pueden estar en snake_case; aquí usamos camelCase.
 */
export interface Usuario {
    idUsuario: number;
    nombreUsuario: string;
    nombre: string;
    apellidos?: string;
    email: string;
    contrasena: string;
    fechaNac?: string;
    sexo?: boolean;
    fotoPerfil?: string;
    biografia?: string;
    fechaRegistro?: string;    // timestamp ISO
    ultimaConexion?: string;   // timestamp ISO
    ubicacion?: string;
}

/**
 * Tipo para crear un usuario (datos que envía el cliente al registrar).
 * No contiene id ni campos generados por el sistema.
 */
export type CrearUsuario = Omit<Usuario, 'idUsuario' | 'fechaRegistro' | 'ultimaConexion'>;

/**
 * Tipo para devolver al frontend (sin contraseña).
 */
export type UsuarioPublico = Omit<Usuario, 'contrasena'>;
