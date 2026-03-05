import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" className="navbar-brand">Auktionsappen</Link>
                <Link to="/">Aktiva Auktioner</Link>
                
                {/* show admin routes if user is admin */}
                {user?.isAdmin && (
                    <div style={{ borderLeft: '1px solid #576574', paddingLeft: '15px' }}>
                        <span class="admin-text" style={{ marginRight: '10px' }}>Admin Panel:</span>
                        <Link to="/admin/auctions">Hantera Auktioner</Link>
                        <span style={{ margin: '0 10px' }}>|</span>
                        <Link to="/admin/users">Hantera Användare</Link>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: '#bdc3c7' }}>
                            {user.username} {user.isAdmin && <span class="admin-text">(Admin)</span>}
                        </span>
                        <Link to="/auctions/create" className="btn" style={{ padding: '6px 12px', fontSize: '1em' }}>Skapa Auktion</Link>
                        <Link to="/profile">Konto</Link>
                        <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '1em' }}>Logga ut</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Logga In / Registrera</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;