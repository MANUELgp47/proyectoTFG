import pool from "../db.js";
import {mapearSettings} from "../utils/mappers.js";
import type {Settings, CreaSettings} from "../types/settings.js";

export const getSettings = async (idUsuario: number): Promise<Settings | null> => {
    const result = await pool.query("SELECT * FROM settings WHERE id_usuario = $1", [idUsuario]);
    if (result.rows.length === 0) return null;
    return mapearSettings(result.rows[0]);
};

//actualizar settings
export const actualizarSettings = async (idUsuario: number, settings: Partial<CreaSettings>): Promise<Settings | null> => {
    // Construir la consulta dinámicamente según los campos proporcionados
    const campos: string[] = [];
    const valores: any[] = [];
    let indice = 1;
    for (const [key, value] of Object.entries(settings)) {
        // Ignorar valores undefined
        if (typeof value === "undefined") continue;

        // convertir nombre de campo camelCase a snake_case
        const campoSnake = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        // Si el valor es un array de números (ej. preferencias, bloqueados), usamos casting a integer[]
        if (Array.isArray(value)) {
            // Asegurar que los elementos sean números
            const numericArray = value.map((v: any) => Number(v));
            campos.push(`${campoSnake} = $${indice}::integer[]`);
            valores.push(numericArray);
        } else {
            // campo normal
            campos.push(`${campoSnake} = $${indice}`);
            valores.push(value);
        }
        indice++;
    }

    // Si no se proporcionaron campos para actualizar, devolvemos los settings actuales
    if (campos.length === 0) {
        return await getSettings(idUsuario);
    }

    valores.push(idUsuario); // Agregar el idUsuario al final para la cláusula WHERE
    const consulta = `UPDATE settings SET ${campos.join(', ')} WHERE id_usuario = $${indice} RETURNING *`;
    console.log("consulta SQL:", consulta);
    console.log("valores:", valores);
    const result = await pool.query(consulta, valores);
    if (result.rows.length === 0) return null;
    return mapearSettings(result.rows[0]);
};
