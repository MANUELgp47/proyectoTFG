import { Resend } from 'resend';
import dotenv from 'dotenv';


// Solo busca el archivo si NO estás en Railway (entorno local)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../ini.env' });
}

//const resend = new Resend(process.env.RESEND_API_KEY);
const resend = new Resend("re_65kgNMB9_NgkpeaoLLP6AFEJkWcf4m9bW");

export const enviarCodigoVerificacion = async (emailDestino: string, codigo: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Dominio de prueba gratuito
            to: emailDestino,
            subject: 'Tu código de verificación ',
            html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h1>¡Bienvenido a la plataforma!</h1>
          <p>Usa el siguiente código para verificar tu cuenta:</p>
          <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">
            ${codigo}
          </h2>
          <p>Este código caducará en 10 minutos.</p>
        </div>
      `,
        });

        if (error) {
            console.error("Error de Resend:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Fallo inesperado al enviar email:", err);
        return { success: false, error: err };
    }
};