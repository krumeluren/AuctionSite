import { useState, useEffect } from 'react';
import { AuctionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './Admin.css';
import '../../App.css';

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
            const data = await AuctionAPI.getAuctions();
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
            await fetchAuctions(); // refresh to show updated state
        } catch (err) {
            alert(`Kunde inte ändra status: ${err.message}`);
        }
    };

    if (loading) return <div>Laddar auktionsdata...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

return (
        <div className="admin-wrapper">
            <div className="admin-header">
                <h2>Administration: Auktioner</h2>
                <p>Här kan du dölja/visa auktioner från det publika</p>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Titel</th>
                            <th>Skapad av</th>
                            <th>Status</th>
                            <th>Åtgärd</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auctions.map(auction => (
                            <tr key={auction.id}>
                                <td>{auction.id}</td>
                                <td>{auction.title}</td>
                                <td>{auction.creatorUsername}</td>
                                <td className={auction.isActive ? 'status-active' : 'status-inactive'}>
                                    {auction.isActive ? 'Aktiv' : 'Inaktiverad'}
                                </td>
                                <td>
                                    <button 
                                        onClick={() => handleToggleStatus(auction.id)} 
                                        className={`btn btn-toggle ${auction.isActive ? 'btn-danger' : 'btn-primary'}`}
                                        style={!auction.isActive ? { backgroundColor: '#27ae60' } : {}}
                                    >
                                        {auction.isActive ? 'Inaktivera' : 'Aktivera'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAuctions;