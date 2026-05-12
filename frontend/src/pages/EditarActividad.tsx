// frontend/src/pages/EditarActividad.tsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateActividad, finalizarActividad } from "../services/actividadService";
import api from "../api/axios";
import {
    Calendar,
    CalendarX,
    MapPin,
    ImagePlus,
    Upload,
    X,
    Ban,
    CheckCheck,
} from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

interface Actividad {
    id?: number;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    ubicacion?: string;
    publica?: boolean;
    estado?: string;
    creadorId?: number;
    imagenes?: string[];
}

export default function EditarActividad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const toDatetimeLocal = (iso?: string | null) => {
        if (!iso) return "";
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    const [archivos, setArchivos] = useState<File | null>(null); // para img (archivo nuevo)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // URL de previsualización (remota o local)
    const [isLocalPreview, setIsLocalPreview] = useState<boolean>(false); // indica si previewUrl fue creado con URL.createObjectURL
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // imagen que ya tenía la actividad
    const [removedExistingImage, setRemovedExistingImage] = useState<boolean>(false); // si el usuario eliminó la imagen existente
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchActividad = async () => {
            try {
                const response = await api.get(`/actividad/${id}`);
                const data = response.data;
                const imgUrl = data.imagenes && data.imagenes.length ? data.imagenes[0] : null;

                // Convertimos las fechas a formato compatible con datetime-local
                setActividad({
                    ...data,
                    fechaInicio: toDatetimeLocal(data.fechaInicio),
                    fechaFin: toDatetimeLocal(data.fechaFin),
                });

                // si hay imagen existente la mostramos como preview (remota)
                setExistingImageUrl(imgUrl);
                setPreviewUrl(imgUrl);
                setIsLocalPreview(false);
            } catch (err) {
                console.error(err);
                setError("Error al cargar la actividad");
            }
        };

        fetchActividad();

        // limpiar preview local cuando se desmonta
        return () => {
            if (isLocalPreview && previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!actividad) return <p>no se detecta actividad...</p>;

    if (actividad.estado !== "activa") {
        return <p>Esta actividad no se puede editar al no estar activa.</p>;
    }

    const handleFileChange = (file: File) => {
        try {
            if (!file) return;

            // liberar preview local anterior si existe
            if (isLocalPreview && previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            const url = URL.createObjectURL(file);
            setArchivos(file);
            setPreviewUrl(url);
            setIsLocalPreview(true);

            // si selecciona un archivo nuevo, ya no consideramos la imagen existente como "presente"
            setExistingImageUrl(null);
            setRemovedExistingImage(false);
        } catch (err) {
            console.error(err);
            setError("Error al procesar la imagen");
        }
    };

    const handleRemoveImage = () => {
        // si la preview es local, liberar el object URL
        if (isLocalPreview && previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setIsLocalPreview(false);
        }

        // si había una imagen existente, marcar que se ha quitado para enviar "" al backend
        if (existingImageUrl) {
            setRemovedExistingImage(true);
            setExistingImageUrl(null);
        }

        // limpiar preview y archivo seleccionado
        setArchivos(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // El botón de cancelar no borra la actividad, solo cambia su estado a "cancelada"
    const handleCancelar = async () => {
        try {
            if (!id) throw new Error("ID de actividad no disponible");
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error("ID inválido");

            const confirmar = window.confirm("¿Seguro que quieres cancelar esta actividad?");
            if (!confirmar) return;

           // setActividad({ ...actividad, estado: "cancelada" });

            const formData = new FormData();

            formData.append("estado", "cancelada");

          /*  if (archivos) {
                formData.append("imagenes", archivos);
            } else if (removedExistingImage) {
                // indicar al backend que borre la imagen existente
                formData.append("imagenes", "eliminar");
            }*/

            await updateActividad(actividadId, formData);


        } catch (err) {
            console.error(err);
            setError("No se pudo cancelar");
        }
        //vuelve
            navigate(`/actividad/${id}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!id) throw new Error("ID de actividad no disponible");
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error("ID de actividad inválido");

            const formData = new FormData();
            formData.append("titulo", actividad.titulo);
            formData.append("descripcion", actividad.descripcion);
            formData.append("fechaInicio", new Date(actividad.fechaInicio).toISOString());
            formData.append("fechaFin", new Date(actividad.fechaFin).toISOString());
            formData.append("ubicacion", actividad.ubicacion ?? "");
            formData.append("publica", String(actividad.publica));
            formData.append("estado", actividad.estado ?? "");

            if (archivos) {
                formData.append("imagenes", archivos);
            } else if (removedExistingImage) {
                // si el usuario eliminó la imagen existente, enviamos cadena vacía
                formData.append("imagenes", "eliminar");
            }

            await updateActividad(actividadId, formData);

            navigate(`/actividad/${id}`);
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar");
        }
    };

    const handleFinalizar = async () => {
        try {
            if (!id) throw new Error("ID de actividad no disponible");
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error("ID de actividad inválido");

            const confirmar = window.confirm("¿Seguro que quieres finalizar esta actividad?");
            if (!confirmar) return;

            await finalizarActividad(actividadId);

            setActividad({ ...actividad, estado: "finalizada" });
        } catch (err) {
            console.error(err);
            setError("No se pudo finalizar");
        }

        navigate(`/actividad/${id}`);
    };



    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <TopBar />

                {/* Cabecera */}
                <div className="mt-4 mb-8">
                    <h1
                        className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Editar actividad
                    </h1>
                    <p className="mt-3 text-neutral max-w-md">
                        Ajusta los detalles. Los cambios serán visibles para todos los
                        participantes.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ============ TÍTULO + DESCRIPCIÓN ============ */}
                    <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
                        <div>
                            <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                Título
                            </label>
                            <input
                                type="text"
                                value={actividad.titulo}
                                onChange={(e) =>
                                    setActividad({ ...actividad, titulo: e.target.value })
                                }
                                required
                                className="mt-2 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-2xl sm:text-3xl font-bold text-secondary placeholder-neutral/50 pb-3 transition"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                Descripción
                            </label>
                            <textarea
                                value={actividad.descripcion}
                                onChange={(e) =>
                                    setActividad({ ...actividad, descripcion: e.target.value })
                                }
                                required
                                rows={4}
                                className="mt-2 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-base text-secondary placeholder-neutral/50 pb-3 transition resize-none"
                            />
                        </div>
                    </div>

                    {/* ============ FECHAS + UBICACIÓN + IMAGEN ============ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                        {/* Fechas + ubicación */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Fechas
                                </label>
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                                        <input
                                            type="datetime-local"
                                            value={actividad.fechaInicio}
                                            onChange={(e) =>
                                                setActividad({
                                                    ...actividad,
                                                    fechaInicio: e.target.value,
                                                })
                                            }
                                            required
                                            className="flex-1 bg-transparent outline-none text-sm text-secondary"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                        <CalendarX className="w-5 h-5 text-primary shrink-0" />
                                        <input
                                            type="datetime-local"
                                            value={actividad.fechaFin}
                                            onChange={(e) =>
                                                setActividad({ ...actividad, fechaFin: e.target.value })
                                            }
                                            className="flex-1 bg-transparent outline-none text-sm text-secondary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Ubicación
                                </label>
                                <div className="mt-3 flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Dirección o enlace virtual"
                                        value={actividad.ubicacion ?? ""}
                                        onChange={(e) =>
                                            setActividad({ ...actividad, ubicacion: e.target.value })
                                        }
                                        className="flex-1 bg-transparent outline-none text-sm text-secondary placeholder-neutral"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="bg-primary-50 rounded-3xl p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="text-lg font-extrabold text-secondary"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    Imagen
                                </h3>
                                <ImagePlus className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-xs text-neutral mb-4">
                                Sustituye o quita la imagen de portada.
                            </p>

                            {previewUrl ? (
                                <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden bg-black">
                                    <img
                                        src={previewUrl}
                                        alt="Previsualización"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) =>
                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-white text-xs font-bold hover:bg-red-500 transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Quitar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 min-h-[180px] rounded-2xl border-2 border-dashed border-primary/40 bg-white/60 flex flex-col items-center justify-center text-center p-6 hover:bg-white transition"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                        <Upload className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-sm font-bold text-primary tracking-wider">
                                        SUBIR IMAGEN
                                    </div>
                                    <div className="text-xs text-neutral mt-1">
                                        Haz clic para seleccionar
                                    </div>
                                </button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileChange(f);
                                }}
                            />
                        </div>
                    </div>

                    {/* ============ ACCIONES DE ESTADO (solo si activa) ============ */}
                    {actividad.estado === "activa" && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm">
                            <div className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase mb-3">
                                Estado de la actividad
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleFinalizar}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tertiary/15 text-secondary font-semibold text-sm hover:bg-tertiary/30 transition"
                                >
                                    <CheckCheck className="w-4 h-4 text-primary" />
                                    Finalizar actividad
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelar}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
                                >
                                    <Ban className="w-4 h-4" />
                                    Cancelar actividad
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ============ GUARDAR / CANCELAR ============ */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full text-secondary font-semibold text-sm hover:bg-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-full text-white font-bold text-sm transition shadow-lg shadow-primary/20"
                            style={{
                                background:
                                    "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                            }}
                        >
                            Actualizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
