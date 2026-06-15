import { useState } from 'react';
import { login as loginApi } from '../api/auth.api';
import { useAuth } from "../context/AuthContext";
import {Link,  useNavigate} from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, Lock } from "lucide-react";

const Login = () => {
    const [nombre_email, setLogin] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // eslint-disable-next-line react-hooks/rules-of-hooks


        setError('');
        setLoading(true);

        try {

            const response = await loginApi({
                nombre_email,
                contrasena,
            });

            // Guardar token en contexto global
            login(response);


            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Credenciales incorrectas');
        } finally {
            setLoading(false);

        }
    };



    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[640px]">
                {/* ============ PANEL IZQUIERDO ============ */}
                <aside
                    className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(135deg, #003C94 0%, #0056D2 50%, #1E40AF 100%)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,229,255,0.2), transparent 50%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 60px)",
                        }}
                    />

                    <div className="relative">
                        <div className="flex items-center gap-2 text-xl font-extrabold">
                            <CheckCircle2 className="w-6 h-6" />
                            <span style={{ fontFamily: "'Manrope', sans-serif" }}>
              Memora
            </span>
                        </div>

                        <h1
                            className="mt-16 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Bienvenido<br />
                            de vuelta.
                        </h1>

                        <p className="mt-6 text-white/80 text-base leading-relaxed max-w-md">
                            Retoma tu actividad donde la dejaste. Tus eventos, tu comunidad y
                            tus recuerdos te están esperando.
                        </p>
                    </div>

                    {/* Testimonio */}
                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 mt-8">
                        <p className="text-sm italic text-white/90 leading-relaxed">
                            "La interfaz se siente como un concierge digital — sofisticado,
                            rápido y fiable."
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                MT
                            </div>
                            <div>
                                <div className="text-sm font-bold">Marcus Thorne</div>
                                <div className="text-[10px] tracking-wider text-white/70 uppercase">
                                    Lead Architect
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ============ PANEL DERECHO (FORMULARIO) ============ */}
                <main className="p-8 sm:p-12 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                        <h2
                            className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Iniciar sesión
                        </h2>
                        <p className="mt-2 text-sm text-neutral">
                            ¿Aún no tienes cuenta?{" "}
                            <Link
                                to="/registro"
                                className="text-primary font-semibold hover:underline"
                            >
                                Crear cuenta
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                            {/* Email / username */}
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase block mb-2">
                                    Email o nombre de usuario
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                                    <input
                                        type="text"
                                        placeholder="ejemplo@correo.com"
                                        value={nombre_email}
                                        onChange={(e) => setLogin(e.target.value)}
                                        required
                                        className="w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-base text-secondary placeholder-neutral/60 pb-2 pl-7 transition"
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                        Contraseña
                                    </label>
                                    <a
                                        href="#"
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        ¿La olvidaste?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={contrasena}
                                        onChange={(e) => setContrasena(e.target.value)}
                                        required
                                        className="w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-base text-secondary placeholder-neutral/60 pb-2 pl-7 transition"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                                }}
                            >
                                {loading ? "Entrando..." : "Entrar"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        {/* Separador + alternativa */}
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[10px] tracking-[0.18em] text-neutral uppercase font-bold">
              o
            </span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <Link to="/registro" className="mt-6 block">
                            <button
                                type="button"
                                className="w-full py-3.5 rounded-full bg-white text-primary border-2 border-primary/20 font-bold text-sm hover:bg-primary-50 transition"
                            >
                                Crear una cuenta nueva
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};


export default Login;
