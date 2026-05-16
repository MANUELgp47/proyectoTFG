import React, {useState, useEffect, useRef} from 'react';
import {crearTag, getTags, eliminarTag} from '../../services/tagService';
import {useAuth} from '../../context/AuthContext';
import type {Tag} from '../../types';
import { Tag as TagIcon, Upload, X, ImagePlus, Trash2 } from "lucide-react";
import TopBar from "../../components/ui/TopBar.tsx";

export default function CrearTag() {
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const auth = useAuth();

    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

    // Imagen para el tag
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        if (auth.rol && auth.rol !== 'admin') {
            window.location.href = '/';
            return;
        }

        const cargarTags = async () => {
            setLoading(true);
            try {
                const t = await getTags();
                setTags(t);
            } catch (err) {
                console.error('Error al obtener tags:', err);
                setError('No se pudieron cargar los tags');
            } finally {
                setLoading(false);
            }
        }

        cargarTags();
    }, [auth.rol]);

    useEffect(() => {
        // limpiar URL cuando cambie imagen o al desmontar
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        // opcional: validar tipo/tamaño aquí
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImagenFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setImagenFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            // Si hay imagen usamos FormData para enviar multipart
            const fd = new FormData();
            fd.append('nombre', nombre);

            if (imagenFile) {

                fd.append('imagen', imagenFile); // nombre campo: 'imagen' (ajustar backend si hace falta)

            }
            await crearTag(fd);

            setSuccess("Tag creado exitosamente");
            setNombre("");
            handleRemoveImage();
            const t = await getTags();
            setTags(t);
        } catch (err) {
            console.error("Error creando tag:", err);
            setError("Error al crear el tag. Inténtalo de nuevo.");
        }
    }

    const handleEliminar = async (idTag: number) => {
        if (!window.confirm('¿Eliminar este tag?')) return;
        setError("");
        setSuccess("");
        try {
            await eliminarTag(idTag);
            setSuccess('Tag eliminado correctamente');
            setTags(prev => prev.filter(t => t.idTag !== idTag));
        } catch (err) {
            console.error('Error al eliminar tag:', err);
            setError('No se pudo eliminar el tag');
        }
    }

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
                        Gestionar tags
                    </h1>
                    <p className="mt-3 text-neutral max-w-md">
                        Crea las etiquetas que usuarios pueden asociar a sus
                        actividades.
                    </p>
                </div>

                {/* Alerts */}
                {loading && (
                    <div className="mb-4 bg-white border border-slate-200 text-neutral rounded-xl px-4 py-3 text-sm">
                        Cargando tags...
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
                    {/* ============ CREAR TAG ============ */}
                    {(!auth.rol || auth.rol === "admin") && (
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-3xl p-7 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                    <TagIcon className="w-5 h-5 text-white" />
                                </div>
                                <h2
                                    className="text-xl font-extrabold text-secondary"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    Crear nuevo tag
                                </h2>
                            </div>

                            {/* Nombre */}
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase block mb-2"
                                >
                                    Nombre del tag
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    placeholder="Ej. Música electrónica"
                                    className="w-full bg-neutral-light rounded-xl px-4 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100 transition"
                                />
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase block mb-2">
                                    Imagen del tag (opcional)
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                                        <img
                                            src={previewUrl}
                                            alt="preview"
                                            className="absolute inset-0 w-full h-full object-cover"
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
                                        onClick={handleAddImageClick}
                                        className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50/40 hover:bg-primary-50 hover:border-primary/60 flex flex-col items-center justify-center transition"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-primary tracking-wider">
                    AÑADIR IMAGEN
                  </span>
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-full text-white font-bold text-sm transition shadow-lg shadow-primary/20"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                                }}
                            >
              <span className="inline-flex items-center gap-2 justify-center">
                <ImagePlus className="w-4 h-4" />
                Crear tag
              </span>
                            </button>
                        </form>
                    )}

                    {/* ============ TAGS EXISTENTES ============ */}
                    <div className="bg-white rounded-3xl p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2
                                className="text-xl font-extrabold text-secondary"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Tags existentes
                            </h2>
                            <span className="text-xs font-bold text-neutral bg-neutral-light px-3 py-1 rounded-full">
              {tags.length}
            </span>
                        </div>

                        {tags.length === 0 && !loading ? (
                            <div className="py-10 text-center text-sm text-neutral">
                                No hay tags todavía.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {tags.map((tag) => (
                                    <li
                                        key={tag.idTag}
                                        className="flex items-center gap-3 py-3 first:pt-0"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0">
                                            {tag.imagen ? (
                                                <img
                                                    src={
                                                        Array.isArray(tag.imagen)
                                                            ? tag.imagen[0]
                                                            : tag.imagen
                                                    }
                                                    alt={tag.nombre}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) =>
                                                        ((e.currentTarget as HTMLImageElement).style.display =
                                                            "none")
                                                    }
                                                />
                                            ) : (
                                                "#"
                                            )}
                                        </div>

                                        <span className="flex-1 text-sm font-semibold text-secondary truncate">
                    {tag.nombre}
                  </span>

                                        <button
                                            type="button"
                                            onClick={() => handleEliminar(tag.idTag)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Eliminar</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}