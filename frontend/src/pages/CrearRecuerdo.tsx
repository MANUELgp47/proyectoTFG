//Crea recuerdo con el id de la actividad por parametro, el id del usuario se obtiene del token. Obtiene la lista de usuario que participaron en la actividad
// typescript
import React, { useRef, useState, useEffect } from "react";
import { crearRecuerdo } from "../services/recuerdoService";
import { getActividadesQueParticipo } from "../services/actividadService";
import { useParams, useNavigate } from "react-router-dom";
import { UploadCloud, ImagePlus, X, Sparkles } from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

type Activity = { idActividad: number; estado?: string; [k: string]: unknown };

type ImageItem = {
    id: string;
    file: File;
    url: string;
};

export default function CrearRecuerdo() {
    const { idActividad } = useParams();
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [items, setItems] = useState<ImageItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // cleanup on unmount: revoke all object URLs
    useEffect(() => {
        return () => {
            items.forEach((it) => URL.revokeObjectURL(it.url));
        };
    }, [items]);

    const addFiles = (files: FileList | File[]) => {
        const selected = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (selected.length === 0) return;

        setItems((prev) => {
            const remaining = Math.max(0, 10 - prev.length);
            const toAddFiles = selected.slice(0, remaining);
            if (selected.length > remaining) {
                setError("Solo se permiten hasta 10 imágenes. Se han tomado las primeras 10.");
            }

            const newItems = toAddFiles.map((f) => {
                const id = typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? (crypto as any).randomUUID()
                    : `${f.name}-${f.size}-${Date.now()}`;
                return {
                    id,
                    file: f,
                    url: URL.createObjectURL(f),
                } as ImageItem;
            });

            return [...prev, ...newItems];
        });

        // permitir volver a seleccionar los mismos archivos
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files || files.length === 0) return;
        addFiles(files);
    };

    const handleOpenFileDialog = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        fileInputRef.current?.click();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            addFiles(files);
        }
    };

    const removeImage = (id: string) => {
        setItems((prev) => {
            const toRemove = prev.find((p) => p.id === id);
            if (toRemove) URL.revokeObjectURL(toRemove.url);
            return prev.filter((p) => p.id !== id);
        });
    };

    const clearImages = () => {
        setItems((prev) => {
            prev.forEach((p) => URL.revokeObjectURL(p.url));
            return [];
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const actividades: Activity[] = await getActividadesQueParticipo();
            const participoEnActividad = actividades.some(
                (actividad) => actividad.idActividad === parseInt(idActividad!)
            );

            if (!participoEnActividad) {
                setError("No puedes crear un recuerdo para una actividad en la que no participaste ");
                return;
            }

            const actividad = actividades.find(
                (actividad) => actividad.idActividad === parseInt(idActividad!)
            );
            if (actividad?.estado !== "finalizada") {
                setError("No puedes crear un recuerdo para una actividad que no ha finalizado");
                return;
            }

            const formData = new FormData();
            formData.append("idActividad", idActividad!);
            formData.append("titulo", titulo);
            formData.append("descripcion", descripcion);

            if (items.length > 0) {
                items.forEach((it) => formData.append("imagenes", it.file));
            }

            const respuesta = await crearRecuerdo(formData);
            console.log("respuesta ", respuesta);
            alert("Recuerdo creado exitosamente");
            navigate(-1);
        } catch (error) {
            console.error(error);
            setError("Error al crear el recuerdo: " + (error instanceof Error ? error.message : ""));
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <TopBar />

                <div className="mt-4 mb-8">
                    <h1
                        className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Crear recuerdo
                    </h1>
                    <p className="mt-3 text-neutral max-w-md">
                        Inmortaliza tus momentos favoritos en tu galería.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
                        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-7">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Título del recuerdo
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                    placeholder="Escribe un título impactante..."
                                    className="mt-3 w-full bg-neutral-light rounded-xl px-5 py-4 text-base text-secondary placeholder-neutral/60 outline-none focus:ring-2 focus:ring-primary-100 transition"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Descripción
                                </label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    required
                                    rows={6}
                                    placeholder="Cuéntanos la historia detrás de este momento..."
                                    className="mt-3 w-full bg-neutral-light rounded-xl px-5 py-4 text-base text-secondary placeholder-neutral/60 outline-none focus:ring-2 focus:ring-primary-100 transition resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div
                                onClick={handleOpenFileDialog}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary-50/40 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-50 hover:border-primary/60 transition"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                                    <UploadCloud className="w-6 h-6 text-primary" />
                                </div>
                                <div
                                    className="text-lg font-extrabold text-secondary"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    Subir imágenes
                                </div>
                                <div className="mt-1 text-sm text-neutral max-w-[240px]">
                                    Arrastra y suelta o haz clic para explorar tus archivos
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileInputChange}
                            />

                            {items.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {items.map((it) => (
                                            <div
                                                key={it.id}
                                                className="relative aspect-square bg-black rounded-2xl overflow-hidden group"
                                            >
                                                <img
                                                    src={it.url}
                                                    alt={it.file.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(it.id)}
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                                                    aria-label="Eliminar imagen"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleOpenFileDialog}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary-50/40 hover:bg-primary-50 hover:border-primary/60 transition flex items-center justify-center"
                                            aria-label="Añadir más imágenes"
                                        >
                                            <ImagePlus className="w-7 h-7 text-primary/70" />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearImages}
                                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                                    >
                                        Eliminar todas y elegir otras
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            className="px-8 py-4 rounded-full text-white font-bold text-sm transition shadow-lg shadow-primary/20"
                            style={{
                                background:
                                    "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                            }}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Publicar recuerdo
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-4 rounded-full text-secondary font-semibold text-sm hover:bg-white transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
