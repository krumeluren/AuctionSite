import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchAuctions();
    }, [user, navigate]);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            // get all auctions (no search string)
            const data = await apiFetch('/Auctions');
            setAuctions(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await apiFetch(`/Auctions/admin/toggle/${id}`, { method: 'PUT' });
            await fetchAuctions(); // Refresh to show updated state
        } catch (err) {
            alert(`Kunde inte ändra status: ${err.message}`);
        }
    };

    if (loading) return <div>Laddar auktionsdata...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Administration: Auktioner</h2>
            <p>Här kan du dölja/visa auktioner från det publika</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Titel</th>
                        <th style={{ padding: '10px' }}>Skapad av</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Åtgärd</th>
                    </tr>
                </thead>
                <tbody>
                    {auctions.map(auction => (
                        <tr key={auction.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{auction.id}</td>
                            <td style={{ padding: '10px' }}>{auction.title}</td>
                            <td style={{ padding: '10px' }}>{auction.creatorUsername}</td>
                            <td style={{ padding: '10px', color: auction.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                                {auction.isActive ? 'Aktiv' : 'Inaktiverad'}
                            </td>
                            <td style={{ padding: '10px' }}>
                                <button 
                                    onClick={() => handleToggleStatus(auction.id)} 
                                    className={`btn ${auction.isActive ? 'btn-danger' : ''}`}
                                    style={{ padding: '5px 10px', fontSize: '0.9em', backgroundColor: auction.isActive ? '' : '#27ae60' }}
                                >
                                    {auction.isActive ? 'Inaktivera' : 'Aktivera'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminAuctions;