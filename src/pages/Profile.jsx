import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuctionAPI } from '../utils/api';
import './Profile.css';
import '../App.css';
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
            await AuctionAPI.changePassword({
                oldPassword: oldPassword,
                newPassword: newPassword
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
        <div className="profile-wrapper">
            <div className="profile-header">
                <h2>Hantera konto</h2>
                <p>Inloggad som: <strong>{user.username}</strong></p>
            </div>
            
            <hr className="profile-divider" />
            
            <h3>Byt lösenord</h3>
            
            {status.message && (
                <div className={`status-message ${status.type === 'error' ? 'status-error' : 'status-success'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Nuvarande lösenord</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Nytt lösenord</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Bekräfta nytt lösenord</label>
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
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: '10px', width: '100%' }}
                >
                    {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
                </button>
            </form>
        </div>
    );
};

export default Profile;