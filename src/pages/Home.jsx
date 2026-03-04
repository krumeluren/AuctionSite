import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [auctions, setAuctions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchAuctions = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = query 
                ? `/Auctions?search=${encodeURIComponent(query)}` 
                : '/Auctions';
            
            const data = await apiFetch(endpoint);
            setAuctions(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAuctions(searchQuery);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Aktiva Auktioner</h1>
                {user ? (
                    <div>
                        <span style={{ marginRight: '15px' }}>Inloggad som: {user.username}</span>
                        <Link to="/auctions/create" style={{ padding: '8px 12px', background: 'black', color: 'white', textDecoration: 'none' }}>
                            Skapa Auktion
                        </Link>
                    </div>
                ) : (
                    <Link to="/login" style={{ padding: '8px 12px', background: 'gray', color: 'white', textDecoration: 'none' }}>
                        Logga in
                    </Link>
                )}
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Sök på titel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Sök
                </button>
            </form>

            {loading && <div>Hämtar data...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {!loading && !error && auctions.length === 0 && (
                <div>Inga öppna auktioner hittades</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {auctions.map((auction) => (
                    <div key={auction.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
                        <h2 style={{ margin: '0 0 10px 0' }}>{auction.title}</h2>
                        <p style={{ margin: '0 0 10px 0', color: '#555' }}>{auction.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div><strong>Nuvarande pris:</strong> {auction.currentPrice} kr</div>
                                <div><strong>Slutar:</strong> {new Date(auction.endDate).toLocaleString('sv-SE')}</div>
                                <div style={{ fontSize: '0.9em', color: '#777' }}>Skapad av: {auction.creatorUsername}</div>
                            </div>
                            <Link 
                                to={`/auctions/${auction.id}`} 
                                style={{ padding: '8px 15px', background: '#0066cc', color: 'white', textDecoration: 'none', borderRadius: '3px' }}
                            >
                                Visa detaljer / Lägg bud
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;