import { useState, useEffect } from 'react';
import { AuctionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './Admin.css';

const AdminUsers = () => {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // get all users
            const data = await AuctionAPI.getUsers();
            setUsersList(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await AuctionAPI.toggleUserStatus(id); // Toggle user status
            await fetchUsers();
        } catch (err) {
            alert(`Kunde inte ändra status: ${err.message}`);
        }
    };

    if (loading) return <div>Laddar användardata...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="admin-wrapper">
            <div className="admin-header">
                <h2>Administration: Användare</h2>
                <p>Hantera aktivering och inaktivering av konton.</p>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Användarnamn</th>
                            <th>Roll</th>
                            <th>Status</th>
                            <th>Åtgärd</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.isAdmin ? 'Administratör' : 'Användare'}</td>
                                <td className={u.isActive ? 'status-active' : 'status-inactive'}>
                                    {u.isActive ? 'Aktiv' : 'Inaktiverad'}
                                </td>
                                <td>
                                    {Number(user.id) !== u.id && (
                                        <button 
                                            onClick={() => handleToggleStatus(u.id)} 
                                            className={`btn btn-toggle ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                                            style={!u.isActive ? { backgroundColor: '#27ae60' } : {}}
                                        >
                                            {u.isActive ? 'Inaktivera' : 'Aktivera'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;