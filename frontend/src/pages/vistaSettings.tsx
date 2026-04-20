import { useEffect, useState } from "react";
import { getMySettings, updateSettings } from "../services/settingsService";
import { getUsuario } from "../services/usuarioService";
import { getTags } from "../services/tagService";
import type { Usuario, Settings, Tag} from "../types.ts";


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

        console.log("Datos a enviar" + settings.preferencias)

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

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Ajustes de la cuenta</h1>

            <section>
                <h2>Preferencias</h2>
                <label style={{ display: "block", marginBottom: 8 }}>
                    <input
                        type="checkbox"
                        checked={!!settings?.perfilPublico}
                        onChange={(e) => handleFieldChange("perfilPublico", e.target.checked)}
                    />
                    Perfil público
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                    <input
                        type="checkbox"
                        checked={!!settings?.actividadPublica}
                        onChange={(e) => handleFieldChange("actividadPublica", e.target.checked)}
                    />
                    Actividades públicas
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                    <input
                        type="checkbox"
                        checked={!!settings?.modoOscuro}
                        onChange={(e) => handleFieldChange("modoOscuro", e.target.checked)}
                    />
                    Modo oscuro
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                    Idioma:
                    <select
                        value={settings?.idioma || "es"}
                        onChange={(e) => handleFieldChange("idioma", e.target.value)}
                        style={{ marginLeft: 8 }}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </label>
            </section>

            <section>
                <h2>Tags (selecciona los que quieras)</h2>
                {tags.length === 0 && <p>No hay tags disponibles.</p>}
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {tags.map((t) => (
                        <li key={t.idTag} style={{ marginBottom: 6 }}>
                            <label>
                                <input
                                    type="checkbox"
                                    // Usamos Number() en ambos lados para asegurar la comparación
                                    checked={settings?.preferencias?.some(p => Number(p) === Number(t.idTag))}
                                    onChange={() => toggleTag(Number(t.idTag))}
                                />
                                <span style={{ marginLeft: 8 }}>{t.nombre}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </section>

            <div style={{ marginTop: 16 }}>
                <button onClick={handleUpdateSettings} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                </button>
            </div>
        </div>
    );
}