//Crea recuerdo con el id de la actividad por parametro, el id del usuario se obtiene del token. Obtiene la lista de usuario que participaron en la actividad

import React, { useRef, useState, useEffect } from "react";
import { crearRecuerdo } from "../services/recuerdoService";
import { getActividadesQueParticipo } from "../services/actividadService";
import { useParams } from "react-router-dom";

type Activity = { idActividad: number; estado?: string; [k: string]: any };

export default function CrearRecuerdo() {
    const { idActividad } = useParams();
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [error, setError] = useState("");

    const [archivos, setArchivos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // cleanup on unmount: revoke all object URLs
        return () => {
            previews.forEach(URL.revokeObjectURL);
        };
    }, [previews]);

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

            if (archivos.length > 0) {
                archivos.forEach((f) => formData.append("imagenes", f));
            }

            const respuesta = await crearRecuerdo(formData);
            console.log("respuesta ", respuesta);
            alert("Recuerdo creado exitosamente");
        } catch (error) {
            console.error(error);
            setError("Error al crear el recuerdo: " + (error instanceof Error ? error.message : ""));
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files || files.length === 0) return;

        const selected = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (selected.length === 0) return;

        setArchivos((prev) => {
            const combined = [...prev, ...selected].slice(0, 10);
            if (prev.length + selected.length > 10) {
                setError("Solo se permiten hasta 10 imágenes. Se han tomado las primeras 10.");
            }

            // revoke previous previews and create new ones from combined
            setPreviews((prevPreviews) => {
                prevPreviews.forEach(URL.revokeObjectURL);
                return combined.map((f) => URL.createObjectURL(f));
            });

            return combined;
        });

        // permitir volver a seleccionar los mismos archivos
        e.currentTarget.value = "";
    };

    const handleOpenFileDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        fileInputRef.current?.click();
    };

    const removeImage = (index: number) => {
        setArchivos((prev) => {
            const next = prev.filter((_, i) => i !== index);
            setPreviews((prevPreviews) => {
                if (prevPreviews[index]) URL.revokeObjectURL(prevPreviews[index]);
                return prevPreviews.filter((_, i) => i !== index);
            });
            return next;
        });
    };

    const clearImages = () => {
        setArchivos([]);
        setPreviews((prev) => {
            prev.forEach(URL.revokeObjectURL);
            return [];
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <h1>Crear Recuerdo</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Título:</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Descripción:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Imagenes:</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                    />

                    <button
                        type="button"
                        onClick={handleOpenFileDialog}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                    >
                        Añadir imágenes
                    </button>

                    {previews.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {previews.map((src, i) => (
                                    <div key={src} style={{ position: "relative" }}>
                                        <img
                                            src={src}
                                            alt={`preview-${i}`}
                                            style={{ maxWidth: 120, maxHeight: 120, objectFit: "cover" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            style={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                background: "red",
                                                color: "white",
                                                border: "none",
                                                padding: "2px 6px",
                                                cursor: "pointer",
                                                fontSize: 12,
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={clearImages}
                                    style={{
                                        marginTop: 8,
                                        background: "transparent",
                                        color: "red",
                                        border: "1px solid red",
                                        padding: "6px 8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Eliminar y elegir otra
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit">Crear Recuerdo</button>
            </form>
        </div>
    );
}