import { useEffect, useState } from "react";
import { getMySettings, updateSettings, solicitarCodigoVerificacion } from "../services/settingsService";
import { getUsuario } from "../services/usuarioService";
import { getTags } from "../services/tagService";
import type { Usuario, Settings, Tag} from "../types.ts";
import { Shield, Globe, ChevronDown, Plus, Fingerprint, X } from "lucide-react";

import TopBar from "../components/ui/TopBar.tsx";

export default function VistaSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
// eslint-disable-next-line react-hooks/exhaustive-deps
        const cargar = async () => {
            setLoading(true);
            setError("");
            try {
                const s = await getMySettings();
                if (!s) {
                    setError("No se encontraron los ajustes del usuario.");
                    setSettings(null);
                    return;
                }
                // Garantizar estructura mínima
                // Dentro de tu useEffect -> cargar()
                const normalized: Settings = {
                    idUsuario: s.idUsuario,
                    perfilPublico: !!s.perfilPublico,
                    actividadPublica: !!s.actividadPublica,
                    modoOscuro: !!s.modoOscuro,
                    idioma: s.idioma || "es",
                    // CAMBIO AQUÍ: Verifica si tu API devuelve 'preferencias' o 'preferencia'
                    preferencias: Array.isArray(s.preferencias) ? s.preferencias : [],
                    usuariosBloqueados: Array.isArray(s.usuariosBloqueados) ? s.usuariosBloqueados : [],
                };
                setSettings(normalized);

                // Cargar usuario
                try {
                    const u = await getUsuario(normalized.idUsuario);
                    setUsuario(u || null);
                } catch (err) {
                    console.error("Error cargando usuario:", err);
                    // no forzamos la parada, solo informamos
                }

                // Cargar tags disponibles
                try {
                    const t = await getTags();
                    setTags(Array.isArray(t) ? t : []);
                } catch (err) {
                    console.error("Error cargando tags:", err);
                }
            } catch (err) {
                console.error("Error cargando settings:", err);
                setError("Error al cargar los ajustes");
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, []);

    // Función para manejar el toggle de tags en preferencias
    const toggleTag = (idTag: number) => {
        if (!settings) return;

        // Aseguramos que trabajamos con números para evitar errores de tipo
        const currentPrefs = settings.preferencias || [];
        const exists = currentPrefs.some(p => Number(p) === idTag);

        let newPrefs;
        if (exists) {
            newPrefs = currentPrefs.filter(p => Number(p) !== idTag);
        } else {
            newPrefs = [...currentPrefs, idTag];
        }

        setSettings({ ...settings, preferencias: newPrefs });
    };

    const handleFieldChange = (field: keyof Settings, value: any) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const handleUpdateSettings = async () => {
        if (!settings) return;
        setError("");
        setSaving(true);



        try {
            await updateSettings(settings);
            if (usuario) {
              //  await updateUsuario(usuario);
            }
            alert("Ajustes actualizados correctamente");
        } catch (err: unknown) {
            console.error("Error actualizando settings:", err);
            setError("Error al actualizar los ajustes");
        } finally {
            setSaving(false);
        }
    };

    const handleSolicitarCodigoVerificacion = async () => {
        try {
            // Aquí llamarías a la función que solicita el código de verificación
            const response = await solicitarCodigoVerificacion();
            if (response.success) {

                window.location.href = "settings/VerificaCodigo";

            } else {
                alert("Error al solicitar el código de verificación.");
            }
        } catch (err) {
            console.error("Error solicitando código de verificación:", err);
            alert("Error al solicitar el código de verificación.");
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;

    function SettingRow({
                            title,
                            subtitle,
                            checked,
                            onChange,
                        }: {
        title: string;
        subtitle?: string;
        checked: boolean;
        onChange: (v: boolean) => void;
    }) {
        return (
            <div className="flex items-center justify-between py-4 first:pt-0 not-first:border-t border-slate-200/60">
                <div className="pr-4">
                    <div className="font-bold text-secondary">{title}</div>
                    {subtitle && (
                        <div className="mt-0.5 text-xs text-neutral">{subtitle}</div>
                    )}
                </div>
                <Toggle checked={checked} onChange={onChange} />
            </div>
        );
    }

    /* Toggle switch custom (sin librería extra) */
    function Toggle({
                        checked,
                        onChange,
                    }: {
        checked: boolean;
        onChange: (v: boolean) => void;
    }) {
        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
                    checked ? "bg-primary" : "bg-slate-300"
                }`}
            >
      <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition my-1 ${
              checked ? "translate-x-6" : "translate-x-1"
          }`}
      />
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <TopBar />

                {/* ============ ACCOUNT IDENTITY ============ */}
                <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 mt-4 mb-8">
                    <div>
                        <h1
                            className="text-3xl font-extrabold text-secondary tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Identidad de cuenta
                        </h1>
                        <p className="mt-2 text-neutral text-sm leading-relaxed max-w-sm">
                            Tu huella única dentro de la plataforma. Aquí ves tu estado y
                            antigüedad.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-8">
                        <div>
                            <div className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                Registrado desde
                            </div>
                            <div
                                className="mt-1 text-2xl font-extrabold text-secondary"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                {/* 👇 Adapta a tu campo real (settings.fechaRegistro / usuario.fechaRegistro) */}
                                {usuario?.fechaRegistro //obtenerlo del usuario, no de los settings
                                    ? new Date(usuario?.fechaRegistro).toLocaleDateString("es", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                Estado
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${usuario?.verificado ? "bg-emerald-500" : "bg-red-500"}`} />
                                <span className="text-base font-bold text-secondary">
    {usuario?.verificado ? "Verificado" : "No verificado"}
  </span>
                            </div>
                        </div>

                        <div className="ml-auto flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                                <Fingerprint className="w-6 h-6 text-primary" />
                            </div>

                            {!usuario?.verificado && (
                                <button
                                    type="button"
                                    onClick={handleSolicitarCodigoVerificacion}
                                    className="px-3 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition"
                                >
                                    Solicitar código
                                </button>
                            )}

                        </div>
                    </div>
                </section>

                {/* ============ PRIVACY + DISPLAY ============ */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Privacy Control */}
                    <div className="bg-neutral-light rounded-3xl p-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <h2
                                className="text-xl font-extrabold text-secondary"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Privacidad
                            </h2>
                        </div>

                        <SettingRow
                            title="Perfil público"
                            subtitle="Permite que otros vean tu perfil y actividad"
                            checked={!!settings?.perfilPublico}
                            onChange={(v) => handleFieldChange("perfilPublico", v)}
                        />
                        <SettingRow
                            title="Actividades públicas"
                            subtitle="Comparte tu asistencia a eventos en tiempo real
                            (Si la desactivas, tu perfil no será mostrado a los usuarios de las actividades públicas)"
                            checked={!!settings?.actividadPublica}
                            onChange={(v) => handleFieldChange("actividadPublica", v)}
                        />
                    </div>

                    {/* Display & Locale */}
                    <div
                        className="rounded-3xl p-7"
                        style={{
                            background:
                                "linear-gradient(135deg, #E8E9FF 0%, #F0EEFF 50%, #E5E7F0 100%)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <Globe className="w-4 h-4 text-white" />
                            </div>
                            <h2
                                className="text-xl font-extrabold text-secondary"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Apariencia e idioma
                            </h2>
                        </div>

                        <SettingRow
                            title="Modo oscuro"
                            subtitle="Cambia a la interfaz nocturna"
                            checked={!!settings?.modoOscuro}
                            onChange={(v) => handleFieldChange("modoOscuro", v)}
                        />

                        <div className="mt-6">
                            <div className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase mb-2">
                                Idioma preferido
                            </div>
                            <div className="relative">
                                <select
                                    value={settings?.idioma || "es"}
                                    onChange={(e) => handleFieldChange("idioma", e.target.value)}
                                    className="w-full appearance-none bg-white rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-secondary outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English (US)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ INTERESTS & PREFERENCES ============ */}
                <section className="bg-white rounded-3xl p-8 shadow-sm mb-8">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
                        <div>
                            <h2
                                className="text-2xl font-extrabold text-secondary tracking-tight"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Intereses y preferencias
                            </h2>
                            <p className="mt-2 text-neutral text-sm">
                                Define los temas que mueven tu feed.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {tags.length === 0 && (
                            <p className="text-sm text-neutral">No hay tags disponibles.</p>
                        )}
                        {tags.map((t) => {
                            const active = settings?.preferencias?.some(
                                (p: number) => Number(p) === Number(t.idTag),
                            );
                            return (
                                <button
                                    key={t.idTag}
                                    type="button"
                                    onClick={() => toggleTag(Number(t.idTag))}
                                    className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                                        active
                                            ? "bg-primary text-white hover:bg-primary-600"
                                            : "bg-transparent text-secondary border-2 border-tertiary hover:bg-tertiary/10"
                                    }`}
                                >
                                    {t.nombre}
                                    {active ? (
                                        <X className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ============ ACCIONES ============ */}
                <div className="flex items-center justify-end gap-3 pb-8">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-full text-secondary font-semibold text-sm hover:bg-white transition"
                    >
                        Descartar cambios
                    </button>
                    <button
                        onClick={handleUpdateSettings}
                        disabled={saving}
                        className="px-8 py-3 rounded-full text-white font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        style={{
                            background:
                                "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                        }}
                    >
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}