import pool from "../db.js";

//setCodigo. introduce el codigo de verificacion y actualiza la fecha con fecha y hora actual
export const setCodigo = async (idUsuario: number, codigo: string): Promise<void> => {
    await pool.query(
        `INSERT INTO codigo_verificacion (id_usuario, codigo, fecha_codigo)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (id_usuario) DO UPDATE SET codigo = EXCLUDED.codigo, fecha_codigo = EXCLUDED.fecha_codigo`,
        [idUsuario, codigo]
    );
};

//getCodigo. obtiene el codigo de verificacion por id de usuario
export const getCodigo = async (idUsuario: number): Promise<string | null> => {
    const result = await pool.query(
        `SELECT codigo FROM codigo_verificacion WHERE id_usuario = $1`,
        [idUsuario]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].codigo;
};
//obtiene la fecha del codigo de verificacion por id de usuario
export const getFechaCodigo = async (idUsuario: number): Promise<string | null> => {
    const result = await pool.query(
        `SELECT fecha_codigo FROM codigo_verificacion WHERE id_usuario = $1`,
        [idUsuario]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].fecha_codigo;
};
//obtiene el objeto completo del codigo de verificacion por id de usuario
export const getCodigoVerificacion = async (idUsuario: number): Promise<{codigo: string, fecha_codigo: string} | null> => {
    const result = await pool.query(
        `SELECT codigo, fecha_codigo FROM codigo_verificacion WHERE id_usuario = $1`,
        [idUsuario]
    );
    if (result.rows.length === 0) return null;
    return {
        codigo: result.rows[0].codigo,
        fecha_codigo: result.rows[0].fecha_codigo,
    };
}
