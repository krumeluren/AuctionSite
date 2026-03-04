import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
                <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Auktionssajten</Link>
                <Link to="/">Aktiva Auktioner</Link>
                
                {/* show admin routes if user is admin */}
                {user?.isAdmin && (
                    <div style={{ borderLeft: '1px solid #576574', paddingLeft: '15px' }}>
                        <span style={{ color: '#f39c12', marginRight: '10px' }}>Admin Panel:</span>
                        <Link to="/admin/auctions">Hantera Auktioner</Link>
                        <Link to="/admin/users">Hantera Användare</Link>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: '#bdc3c7' }}>
                            {user.username} {user.isAdmin && <span style={{ color: '#f39c12' }}>(Admin)</span>}
                        </span>
                        <Link to="/auctions/create" className="btn" style={{ padding: '6px 12px', fontSize: '0.9em' }}>Skapa Auktion</Link>
                        <Link to="/profile">Konto</Link>
                        <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.9em' }}>Logga ut</button>
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