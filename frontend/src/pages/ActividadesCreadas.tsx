import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getActividadesPorUsuario, getActividadesQueParticipo } from "../services/actividadService";
import { getDatosMinimosUsuario } from "../services/usuarioService.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

type Estado = "activa" | "finalizada" | "cancelada";

interface Actividad {
    idActividad: number;
    titulo: string;
    descripcion?: string;
    imagenes?: string | null;
    estado: Estado;
    fechaInicio?: string;
    ubicacion?: string;
}

interface UsuarioMinimo {
    idUsuario: number;
    nombreUsuario: string;
    imagen?: string | null;
}

export default function ActividadesCreadas() {
    const { id } = useParams<{ id: string }>();
    const { idUsuario } = useAuth();

    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [actividadesParticipo, setActividadesParticipo] = useState<Actividad[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuarioMinimo, setUsuarioMinimo] = useState<UsuarioMinimo | null>(null);

    // Nuevo: filtro para mostrar solo activas (marcado por defecto)
    const [soloActivas, setSoloActivas] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const data = await getActividadesPorUsuario(Number(id));
                    setActividades(data ?? []);

                    const minUsuario = await getDatosMinimosUsuario(Number(id));
                    setUsuarioMinimo(minUsuario ?? null);

                    if (Number(id) === idUsuario) {
                        const part = await getActividadesQueParticipo();
                        setActividadesParticipo(part ?? []);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, idUsuario]);

    if (loading) return <p>Cargando...</p>;
    if (!usuarioMinimo) return <p>Usuario no encontrado.</p>;

    /* Badge de estado con color por estado */
    function EstadoBadge({ estado }: { estado: Estado }) {
        const config: Record<Estado, { bg: string; text: string; label: string; dot: string }> = {
            activa: {
                bg: "bg-tertiary",
                text: "text-secondary",
                label: "Activa",
                dot: "bg-emerald-600",
            },
            finalizada: {
                bg: "bg-neutral-light",
                text: "text-neutral",
                label: "Finalizada",
                dot: "bg-neutral",
            },
            cancelada: {
                bg: "bg-red-100",
                text: "text-red-700",
                label: "Cancelada",
                dot: "bg-red-500",
            },
        };
        const c = config[estado] ?? config.finalizada;
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${c.bg} ${c.text}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {c.label}
            </span>
        );
    }

    /* Tarjeta de actividad */
    function ActivityCard({ act }: { act: Actividad }) {
        return (
            <Link
                to={`/actividad/${act.idActividad}`}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col overflow-hidden no-underline"
            >
                <div className="relative w-full aspect-[4/3] bg-blue-100 overflow-hidden">
                    {act.imagenes && (
                        <img
                            src={act.imagenes}
                            alt={act.titulo}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) =>
                                ((e.currentTarget as HTMLImageElement).style.display = "none")
                            }
                        />
                    )}
                    <div className="absolute top-3 left-3">
                        <EstadoBadge estado={act.estado} />
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                    <h3
                        className="text-lg font-extrabold text-secondary leading-snug tracking-tight group-hover:text-primary transition"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        {act.titulo}
                    </h3>

                    {act.descripcion && (
                        <p className="mt-2 text-sm text-neutral leading-relaxed line-clamp-2">
                            {act.descripcion}
                        </p>
                    )}

                    {(act.fechaInicio || act.ubicacion) && (
                        <div className="mt-4 space-y-1.5 text-xs text-neutral">
                            {act.fechaInicio && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    {new Date(act.fechaInicio).toLocaleDateString()}
                                </div>
                            )}
                            {act.ubicacion && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span className="truncate">{act.ubicacion}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-end text-primary text-xs font-bold">
                        <span className="inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            Ver actividad
                            <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    // Aplicar filtro localmente según `soloActivas`
    const visiblesCreadas = actividades.filter((a) => !soloActivas || a.estado === "activa");
    const visiblesParticipo = actividadesParticipo.filter((a) => !soloActivas || a.estado === "activa");

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                <TopBar />

                <header className="mt-4 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/usuario/${usuarioMinimo.idUsuario}`}
                            className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white font-bold shrink-0 hover:opacity-80 transition"
                        >
                            {usuarioMinimo.imagen ? (
                                <img
                                    src={usuarioMinimo.imagen}
                                    alt={usuarioMinimo.nombreUsuario}
                                    className="w-full h-full object-cover"
                                    onError={(e) =>
                                        ((e.currentTarget as HTMLImageElement).style.display = "none")
                                    }
                                />
                            ) : (
                                usuarioMinimo.nombreUsuario.charAt(0).toUpperCase()
                            )}
                        </Link>

                        <div>
                            <h1
                                className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight leading-tight"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Actividades de{" "}
                                <Link
                                    to={`/usuario/${usuarioMinimo.idUsuario}`}
                                    className="text-primary hover:underline"
                                >
                                    @{usuarioMinimo.nombreUsuario}
                                </Link>
                            </h1>
                            <p className="mt-1 text-neutral text-sm">
                                Todo lo que ha creado y aquello en lo que participa.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="text-2xl font-extrabold text-secondary"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Creadas
                        </h2>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-neutral cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={soloActivas}
                                    onChange={(e) => setSoloActivas(e.target.checked)}
                                />
                                Mostrar solo activas
                            </label>

                            {visiblesCreadas.length > 0 && (
                                <span className="text-sm text-neutral">
                                    {visiblesCreadas.length}{" "}
                                    {visiblesCreadas.length === 1 ? "actividad" : "actividades"}
                                </span>
                            )}
                        </div>
                    </div>

                    {visiblesCreadas.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center text-neutral shadow-sm">
                            No hay actividades que mostrar.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {visiblesCreadas.map((act) => (
                                <ActivityCard key={act.idActividad} act={act} />
                            ))}
                        </div>
                    )}
                </section>

                {visiblesParticipo.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-5">
                            <h2
                                className="text-2xl font-extrabold text-secondary"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Participaciones
                            </h2>
                            <span className="text-sm text-neutral">
                                {visiblesParticipo.length}{" "}
                                {visiblesParticipo.length === 1 ? "actividad" : "actividades"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {visiblesParticipo.map((act) => (
                                <ActivityCard key={act.idActividad} act={act} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
