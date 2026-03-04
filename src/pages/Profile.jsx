import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Profile = () => {
    const { user } = useAuth();
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);

    if (!user) {
        return <div style={{ color: 'red' }}>Autentisering krävs</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        if (newPassword !== confirmNewPassword) {
            setStatus({ type: 'error', message: 'De nya lösenorden matchar inte' });
            return;
        }

        if (newPassword.length < 5) {
             setStatus({ type: 'error', message: 'Det nya lösenordet är för kort' });
             return;
        }

        setLoading(true);
        try {
            await apiFetch('/Users/password', {
                method: 'PUT',
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });
            
            setStatus({ type: 'success', message: 'Lösenordet har uppdaterats!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2>Hantera konto</h2>
            <p>Inloggad som: <strong>{user.username}</strong></p>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            
            <h3>Byt lösenord</h3>
            
            {status.message && (
                <div style={{ 
                    padding: '10px', 
                    marginBottom: '15px', 
                    borderRadius: '4px',
                    backgroundColor: status.type === 'error' ? '#ffe6e6' : '#e6ffe6',
                    color: status.type === 'error' ? 'red' : 'green',
                    border: `1px solid ${status.type === 'error' ? 'red' : 'green'}`
                }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nuvarande lösenord</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nytt lösenord</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bekräfta nytt lösenord</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn"
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                >
                    {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
                </button>
            </form>
        </div>
    );
};

export default Profile;