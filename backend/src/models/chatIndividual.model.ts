import pool from "../db.js";
import type {ChatIndividual, CrearChatIndividual} from "../types/chatIndividual.js";
import {mapearChatIndividual} from "../utils/mappers.js";

export const getAllChatIndividuals = async (): Promise<ChatIndividual[]> => {
    const result = await pool.query("SELECT * FROM chat_individual");
    return result.rows.map(mapearChatIndividual);
};

export const getChatIndividualPorId = async (idChatIndividual: number): Promise<ChatIndividual | null> => {
    const result = await pool.query("SELECT * FROM chat_individual WHERE id_chat_individual = $1", [idChatIndividual]);
    if (result.rows.length === 0) return null;
    return mapearChatIndividual(result.rows[0]);
};

//get chat individual por id de usuario1 y id de usuario2
export const getChatIndividualPorUsuarios = async (idUsuario1: number, idUsuario2: number): Promise<ChatIndividual | null> => {
    const result = await pool.query(
        `SELECT * FROM chat_individual 
         WHERE (id_usuario1 = $1 AND id_usuario2 = $2)
            OR (id_usuario1 = $2 AND id_usuario2 = $1)`,
        [idUsuario1, idUsuario2]
    );
    if (result.rows.length === 0) return null;
    return mapearChatIndividual(result.rows[0]);
};  

export const crearChatIndividual = async (chatIndividual: CrearChatIndividual): Promise<ChatIndividual> => {
    const {
        idUsuario1,
        idUsuario2,
    } = chatIndividual;

    const result = await pool.query(
        `INSERT INTO chat_individual
             (id_usuario1, id_usuario2)
         VALUES ($1, $2) RETURNING *`,
        [idUsuario1, idUsuario2]
    );

    return mapearChatIndividual(result.rows[0]);
};

//esteblece el ultimo mensaje del chat individual
export const establecerUltimoMensaje = async (idChatIndividual: number, idMensaje: number): Promise<void> => {
    await pool.query(
        `UPDATE chat_individual
         SET ultimo_mensaje = $1
         WHERE id_chat_individual = $2`,
        [idMensaje, idChatIndividual]
    );
};


export const eliminarChatIndividual = async (idChatIndividual: number): Promise<boolean> => {
    const result = await pool.query("DELETE FROM chat_individual WHERE id_chat_individual = $1", [idChatIndividual]);

    return result.rowCount === 1;// Devuelve true si se eliminó una fila, false si no
};