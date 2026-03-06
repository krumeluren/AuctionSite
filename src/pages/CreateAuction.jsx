import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuctionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

import './CreateAuction.css';
import '../App.css';

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
            const data = await AuctionAPI.createAuction({
                title,
                description,
                startingPrice: numericPrice,
                endDate: selectedDate.toISOString()
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
        <div className="create-auction-wrapper">
            <h2 className="create-auction-title">Skapa ny auktion</h2>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Titel</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Beskrivning</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="5"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Startpris (SEK)</label>
                    <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="1"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Slutdatum och tid</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ width: '100%', marginTop: '10px' }}
                >
                    {loading ? 'Skapar auktion...' : 'Skapa auktion'}
                </button>
            </form>
        </div>
    );
};

export default CreateAuction;