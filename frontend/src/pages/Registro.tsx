import { useState } from 'react';
import { register } from '../api/auth.api';
import {Navigate} from "react-router-dom";
//import { login } from '../api/auth.api';

const Register = () => {
    const [form, setForm] = useState({
        nombreUsuario: '',
        nombre: '',
        apellido: '',
        email: '',
        contrasena: '',
        fechaNac: '',
        sexo: false,
        fotoPerfil: '',
        biografia: '',
        ubicacion: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await register(form);
            setSuccess('Usuario creado correctamente');
            // TODO ejecuta login automático después de registro exitoso
            // await login({ nombre_email: form.email, contrasena: form.contrasena });
            <Navigate to="/"/>


        } catch (err) {
            setError('Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Crear cuenta</h2>
            <br/><input name="nombreUsuario" placeholder="Nombre de usuario" onChange={handleChange} />
            <br/><input name="nombre" placeholder="Nombre" onChange={handleChange} />
            <br/><input name="apellido" placeholder="Apellido" onChange={handleChange} />
            <br/><input name="email" placeholder="Email" onChange={handleChange} />
            <br/><input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} />
            <br/><input type="date" name="fechaNac" onChange={handleChange} />
            <br/><input name="ubicacion" placeholder="Ubicación" onChange={handleChange} />
            <br/><textarea name="biografia" placeholder="Biografía" onChange={handleChange} />

            <br/> <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
        </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
    );
};

export default Register;