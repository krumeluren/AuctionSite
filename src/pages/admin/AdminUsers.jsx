import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            const data = await apiFetch('/Users'); 
            setUsersList(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await apiFetch(`/Users/admin/toggle/${id}`, { method: 'PUT' });
            await fetchUsers();
        } catch (err) {
            alert(`Kunde inte ändra status: ${err.message}`);
        }
    };

    if (loading) return <div>Laddar användardata...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Administration: Användare</h2>
            <p>Hantera aktivering och inaktivering av konton.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Användarnamn</th>
                        <th style={{ padding: '10px' }}>Roll</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Åtgärd</th>
                    </tr>
                </thead>
                <tbody>
                    {usersList.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{u.id}</td>
                            <td style={{ padding: '10px' }}>{u.username}</td>
                            <td style={{ padding: '10px' }}>{u.isAdmin ? 'Administratör' : 'Användare'}</td>
                            <td style={{ padding: '10px', color: u.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                                {u.isActive ? 'Aktiv' : 'Inaktiverad'}
                            </td>
                            <td style={{ padding: '10px' }}>
                                {/* prevent inactivating yourself */}
                                {Number(user.id) !== u.id && (
                                    <button 
                                        onClick={() => handleToggleStatus(u.id)} 
                                        className={`btn ${u.isActive ? 'btn-danger' : ''}`}
                                        style={{ padding: '5px 10px', fontSize: '0.9em', backgroundColor: u.isActive ? '' : '#27ae60' }}
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
    );
};

export default AdminUsers;