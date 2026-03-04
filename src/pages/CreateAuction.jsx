import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CreateAuction = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // validate that user is authenticated before allowing access to the form
    if (!user) {
        return <div style={{ color: 'red', fontFamily: 'sans-serif' }}>Åtkomst nekad. Autentisering krävs för att skapa en auktion.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const selectedDate = new Date(endDate);
        if (selectedDate <= new Date()) {
            setError('Slutdatumet måste vara i framtiden');
            return;
        }

        const numericPrice = parseFloat(startingPrice);
        if (isNaN(numericPrice) || numericPrice < 0) {
            setError('Startpriset måste utgöras av ett positivt värde');
            return;
        }

        setLoading(true);
        try {
            const data = await apiFetch('/Auctions', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    startingPrice: numericPrice,
                    endDate: selectedDate.toISOString()
                })
            });

            // navigate to the new detail after successful creation
            navigate(`/auctions/${data.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Skapa ny auktion</h2>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', backgroundColor: '#ffe6e6' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Titel</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Beskrivning</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="4"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Startpris (SEK)</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Slutdatum och tid</label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: loading ? '#ccc' : '#000', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '10px'
                    }}
                >
                    {loading ? 'Väntar på svar från server...' : 'Skapa auktion'}
                </button>
            </form>
        </div>
    );
};

export default CreateAuction;