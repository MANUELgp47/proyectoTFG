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
        imagen,
    } = usuario;

    const result = await pool.query(
        `INSERT INTO usuario
         (nombre_usuario, nombre, apellidos, email, contraseña, fecha_nac, sexo, foto_perfil, biografia, ubicacion, imagen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [nombreUsuario, nombre, apellidos, email, contrasena, fechaNac, sexo, fotoPerfil, biografia, ubicacion, imagen]
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
//verificar si existe usuario por id, si no devuelve false, si existe devuelve true
export const existeUsuarioPorId = async (idUsuario: number): Promise<boolean> => {
    //comprueba que los datos de entrada son correctos
    /*if (typeof idUsuario !== "number" || isNaN(idUsuario) || idUsuario <= 0) {
        return false;
    }*/
    const result = await pool.query("SELECT 1 FROM usuario WHERE id_usuario = $1", [idUsuario]);
    return result.rows.length > 0;
};

//actualizar usuario
//falla al crear contraseña porque en la db se escribe "contraseña" y en el modelo "contrasena"
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

//actualizar verificado
export const actualizarVerificado = async (idUsuario: number, verificado: boolean): Promise<Usuario | null> => {
    const result = await pool.query("UPDATE usuario SET verificado = $1 WHERE id_usuario = $2 RETURNING *", [verificado, idUsuario]);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
};
//actualizar ultima conexion
export const actualizarUltimaConexion = async (idUsuario: number): Promise<Usuario | null> => {
    const result = await pool.query("UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = $1 RETURNING *", [idUsuario]);
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

// busqueda de usuarios por nombreUsuario que contenga la cadena enviada, devuelve un array de idUsuario.
export const buscarUsuariosPorNombre = async (nombre: string): Promise<{ idUsuario: number| undefined }[]> => {
    const result = await pool.query("SELECT id_usuario FROM usuario WHERE nombre_usuario ILIKE $1", [`%${nombre}%`]);
    return result.rows.map(row => ({ idUsuario: row.id_usuario }));
}

//sistema de cambio de rol
export const cambiarRolUsuario = async (idUsuario: number, nuevoRol: string): Promise<Usuario | null> => {
    const result = await pool.query("UPDATE usuario SET rol = $1 WHERE id_usuario = $2 RETURNING *", [nuevoRol, idUsuario]);
    if (result.rows.length === 0) return null;
    return mapearUsuario(result.rows[0]);
}

//obtener una lista de id de los usuarios por rol
export const obtenerIdUsuariosPorRol = async (roles: string[]): Promise<{ idUsuario: number }[]> => {
    const placeholders = roles.map((_, index) => `$${index + 1}`).join(', ');
    const result = await pool.query(`SELECT id_usuario FROM usuario WHERE rol IN (${placeholders})`, roles);
    return result.rows.map(row => ({ idUsuario: row.id_usuario }));
}