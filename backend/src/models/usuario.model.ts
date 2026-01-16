import pool from "../db.js";
import type {Usuario, CrearUsuario} from "../types/usuario.js";
import {mapearUsuario} from "../utils/mappers.js";

/**
 * Obtiene todos los usuarios de la base de datos
 */
export const getAllUsuarios = async (): Promise<Usuario[]> => {
    const result = await pool.query("SELECT * FROM usuario");
    return result.rows.map(mapearUsuario);
};

/**
 * Obtiene un usuario por su ID
 */
export const getUsuarioPorId = async (idUsuario: number): Promise<Usuario | null> => {
    const result = await pool.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
};

/**
 * Crea un nuevo usuario
 */
export const crearUsuario = async (usuario: CrearUsuario): Promise<Usuario> => {
    const {
        nombreUsuario,
        nombre,
        apellidos,
        email,
        contrasena,
        fechaNac,
        sexo,
        fotoPerfil,
        biografia,
        ubicacion,
    } = usuario;

    const result = await pool.query(
        `INSERT INTO usuario
         (nombre_usuario, nombre, apellidos, email, contraseña, fecha_nac, sexo, foto_perfil, biografia, ubicacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [nombreUsuario, nombre, apellidos, email, contrasena, fechaNac, sexo, fotoPerfil, biografia, ubicacion]
    );

    return mapearUsuario(result.rows[0]);// Retorna el usuario creado y mapeado para que los atributos coincidan con la interfaz Usuario
};

//obtener usuario por email
export const getUsuarioPorEmail = async (email: string): Promise<Usuario | null> => {
    const result = await pool.query("SELECT * FROM usuario WHERE email = $1", [email]);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
};

//verificar si existe usuario por email
export const existeUsuarioPorEmail = async (email: string): Promise<boolean> => {
    const result = await pool.query("SELECT 1 FROM usuario WHERE email = $1", [email]);
    return result.rows.length > 0;
};

//obtener usuario por nombre de usuario
export const getUsuarioPorNombreUsuario = async (nombreUsuario: string): Promise<Usuario | null> => {
    const result = await pool.query("SELECT * FROM usuario WHERE nombre_usuario = $1", [nombreUsuario]);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
};

//verificar si existe usuario por nombre de usuario
export const existeUsuarioPorNombreUsuario = async (nombreUsuario: string): Promise<boolean> => {
    const result = await pool.query("SELECT 1 FROM usuario WHERE nombre_usuario = $1", [nombreUsuario]);
    return result.rows.length > 0;
};
//verificar si existe usuario por id
export const existeUsuarioPorId = async (idUsuario: number): Promise<boolean> => {
    const result = await pool.query("SELECT 1 FROM usuario WHERE id_usuario = $1", [idUsuario]);
    return result.rows.length > 0;
};

//actualizar usuario
export const actualizarUsuario = async (idUsuario: number, usuario: Partial<CrearUsuario>): Promise<Usuario | null> => {
    // Construir la consulta dinámicamente según los campos proporcionados
    const campos = [];
    const valores = [];
    let indice = 1;
    for (const [key, value] of Object.entries(usuario)) {
        campos.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${indice}`);
        valores.push(value);
        indice++;
    }
    valores.push(idUsuario); // Agregar el idUsuario al final para la cláusula WHERE
    const consulta = `UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = $${indice} RETURNING *`;
    const result = await pool.query(consulta, valores);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
};


/**
 * Elimina un usuario
 */
export const eliminarUsuario = async (idUsuario: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM usuario WHERE id_usuario = $1", [idUsuario]);

    if (result.rowCount === 0) {
        return false;

    } else {
        return true;
    }

    //  return result.rowCount > 0;
};
