import nodemailer from "nodemailer";

export class CorreoService {

    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.CORREO,
                pass: process.env.CONTRASENA_CORREO
            }
        });
    }

    async enviarCorreo(destinatario: string, asunto: string, mensaje: string): Promise<void> {
        const mailOptions = {
            from: process.env.CORREO,
            to: destinatario,
            subject: asunto,
            text: mensaje
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Correo enviado a ${destinatario}`);
        } catch (error) {
            console.error(`Error al enviar correo a ${destinatario}:`, error);
            throw error;
        }
    }

    //Metodo de verificación de correo, recibe un código de verificación y el correo del usuario, y envía un correo con el código de verificación
    async enviarCorreoVerificacion(destinatario: string, codigoVerificacion: string): Promise<void> {
        const asunto = "Código de verificación para tu cuenta";
        const mensaje = `Tu código de verificación es: ${codigoVerificacion}`;
        await this.enviarCorreo(destinatario, asunto, mensaje);
    }


}