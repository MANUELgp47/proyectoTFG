import { useState } from 'react';
import { login as loginApi } from '../api/auth.api';
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [nombre_email, setLogin] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { login } = useAuth();

        setError('');
        setLoading(true);

        try {
            //console.log('Intentando login con', { nombre_email, contrasena });
            const response = await loginApi({
                nombre_email,
                contrasena,
            });

            // Guardar token en contexto global
            login(response.token);

            // Guardar token
            localStorage.setItem('token', response.token);
            console.log('respuesta '+response);


            console.log('Login correcto');
        } catch (err: any) {
            console.error(err);
            setError('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <input
                type="text"
                placeholder="Email o nombre de usuario"
                value={nombre_email}
                onChange={(e) => setLogin(e.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};


export default Login;
