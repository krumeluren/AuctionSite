import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

import './Login.css';
import '../App.css';

const Login = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const endpoint = isLoginMode ? '/Users/login' : '/Users/register';
        const payload = isLoginMode 
            ? { username, password } 
            : { username, email, password };

        try {
            const data = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            login({
                id: data.id,
                token: data.token,
                username: data.username
            });

            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>{isLoginMode ? 'Logga in' : 'Registrera användare'}</h2>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Användarnamn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                
                {!isLoginMode && (
                    <input
                        type="email"
                        placeholder="E-post"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}

                <input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    {isLoginMode ? 'Logga in' : 'Registrera'}
                </button>
            </form>

            <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                style={{ marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isLoginMode ? 'Skapa ett nytt konto' : 'Har du redan ett konto? Logga in'}
            </button>
        </div>
    );
};

export default Login;