import { useEffect, useState } from 'react';
import { getAmistades } from '../services/amistadService';
import { getDatosMinimosUsuario, buscarUsuariosNombre } from '../services/usuarioService';
import {  useParams } from 'react-router-dom';
import {useAuth} from "../context/AuthContext.tsx";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, UserPlus2, Users } from "lucide-react";
import TopBar from "../components/ui/TopBar";

interface Amistad {
    idUsuario1: number;
    idUsuario2: number;
}

interface UsuarioMinimo {
    idUsuario: number;
    nombreUsuario: string;
    imagen?: string;
}

export default function ListaAmigos() {
    const [amigos, setAmigos] = useState<number[]>([]);
    const [usuariosMinimos, setUsuariosMinimos] = useState<Record<number, UsuarioMinimo | undefined>>({});
    const [loading, setLoading] = useState(true);

    // Estado para el buscador (solo visible si es mi perfil)
    const [nombreBusqueda, setNombreBusqueda] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState<Record<number, UsuarioMinimo | undefined>>({});
    const [buscando, setBuscando] = useState(false);

    const { idUsuarioParametros } = useParams<{ idUsuarioParametros?: string }>();
    const perfilId = Number(idUsuarioParametros ?? 0);
    const [esMiPerfil, setEsMiPerfil] = useState(false);

    const {idUsuario} = useAuth();
    const navigate = useNavigate();


    // OBTENER id del usuario en sesión. Reemplazar si usas contexto / redux / auth provider



    useEffect(() => {
        const fetchAmigos = async () => {
            setLoading(true);

            const miPerfil = perfilId === idUsuario;
            setEsMiPerfil(miPerfil);

            try {
                const amistades: Amistad[] = await getAmistades(perfilId);
                const friendIds = amistades.map(a =>
                    Number(a.idUsuario1) === perfilId ? Number(a.idUsuario2) : Number(a.idUsuario1)
                );
                setAmigos(friendIds);

                // Cargar datos mínimos
                await Promise.all(
                    friendIds.map(async (id) => {
                        // marcar como cargando para evitar duplicados
                        setUsuariosMinimos(prev => prev[id] ? prev : ({ ...prev, [id]: undefined }));
                        const datos = await getDatosMinimosUsuario(id);
                        if (datos) {
                            setUsuariosMinimos(prev => ({ ...prev, [id]: { idUsuario: id, nombreUsuario: datos.nombreUsuario, imagen: datos.imagen } }));
                        }
                    })
                );
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (!isNaN(perfilId) && perfilId > 0) {
            fetchAmigos();
        } else {
            setLoading(false);
        }
    }, [perfilId]);

    // DEBOUNCE + búsqueda de usuarios (solo si es mi perfil y uso el buscador)
    useEffect(() => {
        if (!esMiPerfil) return;
        if (nombreBusqueda.trim() === '') {
            setResultadosBusqueda({});
            setBuscando(false);
            return;
        }

        setBuscando(true);
        const timer = setTimeout(async () => {
            try {
                const encontrados = await buscarUsuariosNombre(nombreBusqueda);
                const nuevos: Record<number, UsuarioMinimo | undefined> = {};
                await Promise.all(encontrados.map(async (r: any) => {
                    const datosMin = await getDatosMinimosUsuario(r.idUsuario);
                    if (datosMin) {
                        nuevos[r.idUsuario] = { idUsuario: r.idUsuario, nombreUsuario: datosMin.nombreUsuario, imagen: datosMin.imagen };
                    }
                }));
                setResultadosBusqueda(nuevos);
            } catch (err) {
                console.error('Error en búsqueda:', err);
                setResultadosBusqueda({});
            } finally {
                setBuscando(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [nombreBusqueda, esMiPerfil]);

    if (loading) return <p>Cargando...</p>;


    interface UserListItemProps {
        idUsuario: number | string;
        nombreUsuario: string;
        imagen?: string | null;
        compact?: boolean;
    }

    function UserListItem({
                              idUsuario,
                              nombreUsuario,
                              imagen,
                              compact = false,
                          }: UserListItemProps) {
        const size = compact ? 36 : 44;
        return (
            <Link
                to={`/usuario/${idUsuario}`}
                className="flex items-center gap-3 py-3 hover:bg-neutral-light/50 -mx-2 px-2 rounded-xl transition group"
            >
                <div
                    className="rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white font-semibold shrink-0"
                    style={{ width: size, height: size, fontSize: size * 0.4 }}
                >
                    {imagen ? (
                        <img
                            src={imagen}
                            alt={nombreUsuario}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                                ((e.currentTarget as HTMLImageElement).style.display = "none")
                            }
                        />
                    ) : (
                        (nombreUsuario || "?").charAt(0).toUpperCase()
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-secondary truncate group-hover:text-primary transition">
                        @{nombreUsuario}
                    </div>
                </div>
            </Link>
        );
    }


    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <TopBar />

                {/* Volver + Cabecera */}
                <div className="mt-4 flex items-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white text-secondary flex items-center justify-center hover:bg-neutral-light transition shadow-sm shrink-0"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1
                            className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight leading-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Lista de amigos
                        </h1>
                        <p className="text-sm text-neutral mt-1">
                            {amigos.length}{" "}
                            {amigos.length === 1 ? "amistad" : "amistades"}
                        </p>
                    </div>
                </div>

                {/* Grid responsive */}
                <div
                    className={`grid grid-cols-1 gap-6 ${
                        esMiPerfil ? "lg:grid-cols-[1fr_320px]" : ""
                    }`}
                >
                    {/* ============ LISTA DE AMIGOS ============ */}
                    <main className={esMiPerfil ? "order-2 lg:order-1" : ""}>
                        <div className="bg-white rounded-3xl p-6 shadow-sm">
                            <h2
                                className="text-lg font-extrabold text-secondary mb-4 flex items-center gap-2"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                <Users className="w-5 h-5 text-primary" />
                                Amigos
                            </h2>

                            {amigos.length === 0 ? (
                                <div className="py-10 text-center text-neutral text-sm">
                                    {esMiPerfil
                                        ? "Aún no tienes amigos. Empieza buscando usuarios."
                                        : "Este usuario no tiene amigos aún."}
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {amigos.map((amigoId) => {
                                        const usuario = usuariosMinimos[amigoId];
                                        return (
                                            <li key={amigoId}>
                                                <UserListItem
                                                    idUsuario={usuario?.idUsuario ?? amigoId}
                                                    nombreUsuario={usuario?.nombreUsuario ?? "Cargando..."}
                                                    imagen={usuario?.imagen}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </main>

                    {/* ============ BUSCAR (solo si es mi perfil) ============ */}
                    {esMiPerfil && (
                        <aside className="order-1 lg:order-2">
                            <div className="bg-white rounded-3xl p-6 shadow-sm lg:sticky lg:top-6">
                                <h2
                                    className="text-lg font-extrabold text-secondary mb-4 flex items-center gap-2"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    <UserPlus2 className="w-5 h-5 text-primary" />
                                    Buscar usuarios
                                </h2>

                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                                    <input
                                        type="text"
                                        value={nombreBusqueda}
                                        onChange={(e) => setNombreBusqueda(e.target.value)}
                                        placeholder="Escribe un nombre..."
                                        autoFocus
                                        className="w-full bg-neutral-light rounded-full pl-11 pr-4 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100 transition"
                                    />
                                </div>

                                {/* Resultados */}
                                <div className="min-h-[60px]">
                                    {buscando && (
                                        <div className="text-sm text-neutral text-center py-6">
                                            Buscando...
                                        </div>
                                    )}

                                    {!buscando &&
                                        nombreBusqueda.length > 0 &&
                                        Object.values(resultadosBusqueda).filter(Boolean).length ===
                                        0 && (
                                            <div className="text-sm text-neutral text-center py-6">
                                                Ningún usuario encontrado.
                                            </div>
                                        )}

                                    {!buscando && (
                                        <ul className="divide-y divide-slate-100">
                                            {Object.values(resultadosBusqueda).map((usuario) =>
                                                usuario ? (
                                                    <li key={usuario.idUsuario}>
                                                        <UserListItem
                                                            idUsuario={usuario.idUsuario}
                                                            nombreUsuario={usuario.nombreUsuario}
                                                            imagen={usuario.imagen}
                                                            compact
                                                        />
                                                    </li>
                                                ) : null,
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}