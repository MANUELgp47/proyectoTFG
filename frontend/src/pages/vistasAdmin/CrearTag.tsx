import React, {useState, useEffect, useRef} from 'react';
import {crearTag, getTags, eliminarTag} from '../../services/tagService';
import {useAuth} from '../../context/AuthContext';
import type {Tag} from '../../types';

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
        <div className="container mt-5">
            <h1>Crear Nuevo Tag</h1>

            {loading && <p>Cargando tags...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {(!auth.rol || auth.rol === 'admin') && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre del Tag</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={handleFileChange}
                        />
                        <button type="button" className="btn btn-secondary me-2" onClick={handleAddImageClick}>
                            Añadir imagen
                        </button>
                        {imagenFile && (
                            <button type="button" className="btn btn-danger" onClick={handleRemoveImage}>
                                Eliminar imagen
                            </button>
                        )}
                    </div>

                    {previewUrl && (
                        <div className="mb-3">
                            <img src={previewUrl} alt="preview" style={{maxWidth: 200, maxHeight: 200}}/>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary">Crear Tag</button>
                </form>
            )}

            <hr/>

            <h3>Tags existentes</h3>
            {tags.length === 0 && !loading && <p>No hay tags.</p>}
            <ul>
                {tags.map(tag => (
                    <li key={tag.idTag} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>{tag.nombre}</span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(tag.idTag)}>Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}