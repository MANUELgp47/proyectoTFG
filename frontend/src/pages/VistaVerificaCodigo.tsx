//Muestra los datos de una notificación y la marca como leida al abrirla
import {useEffect, useState} from 'react';

import {useAuth} from "../context/AuthContext";

import {useNavigate} from 'react-router-dom';
import TopBar from "../components/ui/TopBar.tsx";
import {enviarCodigoVerificacion} from "../services/settingsService.ts"

export default function VistaVerificaCodigo() {


    const navigate = useNavigate();
    const {idUsuario: idUsuarioSesion} = useAuth();
    const [codigo, setCodigo] = useState<string>("");

    useEffect(() => {


    }, [idUsuarioSesion]);


    const handleEnviarCodigo = async (codigo: string) => {
        try {
            //comprueba que es un numero de 6 digitos
            if (!/^\d{6}$/.test(codigo.toString())) {
                alert('El código de verificación debe ser un número de 6 dígitos');
                return;
            }

            const resultado = await enviarCodigoVerificacion(codigo);

            if (resultado.success) {
                alert('Vierificación exitosa.');
                navigate('/settings');
            } else {
                alert('Error al enviar el código de verificación: ' + resultado.message);
            }
        } catch (error) {
            console.error('Error al enviar el código de verificación:', error);
           // setError(error);

        }

    }


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center gap-6">
            <div className="w-full">
                <TopBar/>
            </div>

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">

                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        aria-label="Volver"
                    >
                        ‹
                    </button>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                        Detalle de Notificación
                    </h1>
                </div>

                <div className="p-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleEnviarCodigo(codigo);
                        }}
                    >
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Código de verificación
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Introduce el código de 6 dígitos"
                            aria-label="Código de verificación"
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition"
                            >
                                Enviar código
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}