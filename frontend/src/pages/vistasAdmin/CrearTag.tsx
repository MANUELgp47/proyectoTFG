//Pagina en la que el admin puede crear un nuevo tag. Ademas muestra los tags existentes y permite eliminarlos.

import React, { useState, useEffect } from 'react';
import { crearTag, getTags, eliminarTag } from '../../services/tagService';
import {useAuth} from "../../context/AuthContext";
import type { Tag } from '../../types';

export default function CrearTag() {
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const auth = useAuth();

    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Si el rol está definido y no es admin, redirigir
        if (auth.rol && auth.rol !== 'admin') {
            window.location.href = '/';
            return;
        }

        // cargar tags
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await crearTag({ nombre });
            setSuccess("Tag creado exitosamente");
            setNombre("");
            // refrescar lista
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
            // actualizar lista localmente
            setTags(prev => prev.filter(t => t.idTag !== idTag));
        } catch (err) {
            console.error('Error al eliminar tag:', err);
            setError('No se pudo eliminar el tag');
        }
    }

    return (
        <div className="container mt-5">
            <h2>Crear Nuevo Tag</h2>

            {loading && <p>Cargando tags...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Formulario solo visible para admin (si rol undefined, mostramos hasta que se resuelva) */}
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
                    <button type="submit" className="btn btn-primary">Crear Tag</button>
                </form>
            )}

            <hr />

            <h3>Tags existentes</h3>
            {tags.length === 0 && !loading && <p>No hay tags.</p>}
            <ul>
                {tags.map(tag => (
                    <li key={tag.idTag} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>{tag.nombre}</span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(tag.idTag)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}