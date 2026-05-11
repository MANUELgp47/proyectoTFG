/*
*
* CREATE TABLE codigo_verificacion (
    id_usuario INT PRIMARY KEY REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    codigo VARCHAR(6) DEFAULT '0',
    fecha_codigo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
* */

export interface CodigoVerificacion {
    id_usuario: number;
    codigo: string;
    fecha_codigo: string; // timestamp ISO
}

export type CreaCodigoVerificacion = Omit<CodigoVerificacion, 'id_usuario' | 'fecha_codigo'>;