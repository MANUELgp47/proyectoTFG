import { useEffect, useState } from "react";
import { getUsuario, updateUsuario } from "../services/usuarioService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/ui/TopBar.tsx";
import { MapPin, Pencil, Camera } from "lucide-react";
import { useRef } from "react";

export default function EditarPerfilUsuario() {

    const [usuario, setUsuario] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { idUsuario } = useAuth();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                if (idUsuario == null) return;
                console.log("Obteniendo datos del usuario...");
                const response = await getUsuario(Number(idUsuario));

                setUsuario(response);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsuario();
    }, [idUsuario]);

    if (!usuario) {
        return <div>Cargando...</div>;
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUsuario({
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                biografia: usuario.biografia,
                ubicacion: usuario.ubicacion
            });
            navigate(`/usuario/${idUsuario}`);//vuleve al perfil del usuario
        } catch (error) {
            console.error(error);
        }

    }



    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // TODO: subir 'file' al backend y guardar la URL devuelta en usuario.foto
        console.log("Foto seleccionada:", file.name);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[800px] mx-auto px-6 py-6">
                <TopBar />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 bg-white rounded-3xl shadow-sm overflow-hidden"
                >
                    {/* ============ BANNER + AVATAR ============ */}
                    <div
                        className="relative h-44"
                        style={{
                            background:
                                "linear-gradient(90deg, #003C94 0%, #0056D2 50%, #4f7cff 100%)",
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 80px)",
                            }}
                        />

                        {/* Avatar superpuesto */}
                        <div className="absolute -bottom-14 left-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full ring-4 ring-white bg-secondary overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {usuario.foto ? (
                                        <img
                                            src={usuario.foto}
                                            alt={usuario.nombre}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                ((e.currentTarget as HTMLImageElement).style.display =
                                                    "none")
                                            }
                                        />
                                    ) : (
                                        (usuario.nombre ?? "U").charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* Botón cambiar foto (ya cableado para cuando lo implementes) */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition shadow-md ring-2 ring-white"
                                    aria-label="Cambiar foto"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ CONTENIDO ============ */}
                    <div className="px-10 pt-20 pb-10">
                        {/* Cabecera */}
                        <h1
                            className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Editar perfil
                        </h1>
                        <p className="mt-2 text-neutral text-sm">
                            Gestiona tu identidad y preferencias.
                        </p>

                        {/* Ubicación */}
                        <div className="mt-10">
                            <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                                <MapPin className="w-4 h-4" />
                                Ubicación
                            </label>
                            <input
                                type="text"
                                value={usuario.ubicacion ?? ""}
                                onChange={(e) =>
                                    setUsuario({ ...usuario, ubicacion: e.target.value })
                                }
                                placeholder="Tu ciudad"
                                className="mt-3 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-2xl font-bold text-secondary placeholder-neutral/40 pb-2 transition"
                            />
                        </div>

                        {/* Biografía */}
                        <div className="mt-10">
                            <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                                <Pencil className="w-4 h-4" />
                                Biografía
                            </label>
                            <textarea
                                value={usuario.biografia ?? ""}
                                onChange={(e) =>
                                    setUsuario({ ...usuario, biografia: e.target.value })
                                }
                                placeholder="Cuéntanos sobre ti..."
                                rows={5}
                                className="mt-3 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-base text-secondary placeholder-neutral/40 pb-3 transition resize-none leading-relaxed"
                            />
                        </div>

                        {/* Acciones */}
                        <div className="mt-10 flex items-center gap-3">
                            <button
                                type="submit"
                                className="px-7 py-3 rounded-full text-white font-bold text-sm transition shadow-lg shadow-primary/20"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                                }}
                            >
                                Guardar cambios
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-7 py-3 rounded-full bg-white text-secondary border border-slate-200 font-semibold text-sm hover:bg-neutral-light transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );};
