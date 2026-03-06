import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuctionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuctionDetail.css';
import '../App.css';
const formatLocalTime = (dateString) => {
    if (!dateString) return '';
    const isUtc = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return new Date(isUtc).toLocaleString('sv-SE');
};
const AuctionDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateDescription, setUpdateDescription] = useState('');
    const [updateStartingPrice, setUpdateStartingPrice] = useState('');
    const [updateError, setUpdateError] = useState(null);

    const fetchAuction = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AuctionAPI.getAuctionById(id);
            setAuction(data);
            setUpdateTitle(data.title);
            setUpdateDescription(data.description);
            setUpdateStartingPrice(data.startingPrice);
        } catch (err) {
            setError('Auktionen kunde inte hittas eller är dold..');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuction();
    }, [id]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setBidError(null);
        const numericAmount = parseFloat(bidAmount);
        
        if (isNaN(numericAmount) || numericAmount <= auction.currentPrice) {
            setBidError(`Budet måste vara högre än ${auction.currentPrice} kr`);
            return;
        }

        try {
            await AuctionAPI.placeBid(id, numericAmount);
            setBidAmount('');
            await fetchAuction();
        } catch (err) {
            setBidError(err.message);
        }
    };

    const handleRetractBid = async (bidId) => {
        try {
            await AuctionAPI.retractBid(bidId);
            await fetchAuction();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateAuction = async (e) => {
        e.preventDefault();
        setUpdateError(null);
        try {
            await AuctionAPI.updateAuction(id, {
                title: updateTitle,
                description: updateDescription,
                startingPrice: parseFloat(updateStartingPrice)
            });
            setIsEditing(false);
            await fetchAuction();
        } catch (err) {
            setUpdateError(err.message);
        }
    };

    if (loading) return <div>Hämtar data...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!auction) return <div>Auktionen hittades inte</div>;

    console.log("Data arrived. Creator ID:", auction.creatorId, "User ID:", user?.id);

    console.log(auction.endDate, "isOpen:", auction.isOpen, "isActive:", auction.isActive);

    const isCreator = user && Number(user.id) === Number(auction.creatorId);
    const hasBids = auction.bids && auction.bids.length > 0;

    return (
        <div className="auction-detail-wrapper">
            <Link to="/" className="back-link">
                &larr; Tillbaka till listan
            </Link>

            <div className={`auction-card ${auction.isActive ? 'active' : 'inactive'}`}>
                {!auction.isActive && <div className="admin-warning">[INAKTIVERAD AV ADMINISTRATÖR]</div>}
                
                {isEditing ? (
                    <form onSubmit={handleUpdateAuction}>
                        {updateError && <div className="error-message">{updateError}</div>}
                        
                        <div className="form-group">
                            <label className="form-label">Titel</label>
                            <input 
                                className="form-control"
                                value={updateTitle} 
                                onChange={(e) => setUpdateTitle(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Beskrivning</label>
                            <textarea 
                                className="form-control"
                                value={updateDescription} 
                                onChange={(e) => setUpdateDescription(e.target.value)} 
                                required 
                                rows="4" 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Startpris</label>
                            <input 
                                type="number" 
                                className="form-control"
                                value={updateStartingPrice} 
                                onChange={(e) => setUpdateStartingPrice(e.target.value)} 
                                disabled={hasBids} 
                            />
                            {hasBids && <small className="info-text">Startpris kan ej ändras (bud existerar).</small>}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Spara ändringar</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ backgroundColor: '#95a5a6', color: 'white' }}>Avbryt</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="auction-header">
                            <h1>{auction.title}</h1>
                            {isCreator && auction.isOpen && (
                                <button onClick={() => setIsEditing(true)} className="btn" style={{ backgroundColor: '#f39c12', color: 'white' }}>Redigera</button>
                            )}
                        </div>
                        <p className="auction-description">{auction.description}</p>
                        
                        <div className="auction-info-grid">
                            <div><strong>Startpris:</strong> {auction.startingPrice} kr</div>
                            <div className="current-price-highlight"><strong>Aktuellt pris:</strong> {auction.currentPrice} kr</div>
                            <div><strong>Startdatum:</strong> {formatLocalTime(auction.startDate)}</div>
                            <div><strong>Slutdatum:</strong> {formatLocalTime(auction.endDate)}</div>
                            <div><strong>Säljare:</strong> {auction.creatorUsername}</div>
                            <div>
                                <strong>Status:</strong> 
                                <span className={auction.isOpen ? 'status-open' : 'status-closed'}>
                                    {auction.isOpen ? 'Öppen' : 'Avslutad'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {auction.isOpen && user && !isCreator && auction.isActive && (
                <div className="bid-section">
                    <h3>Lägg ett bud</h3>
                    {bidError && <div className="error-message">{bidError}</div>}
                    
                    <form onSubmit={handleBidSubmit} className="bid-form">
                        <input
                            type="number"
                            className="form-control bid-input"
                            min={auction.currentPrice + 1}
                            step="1"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary">Bekräfta bud</button>
                    </form>
                </div>
            )}

            {!auction.isOpen ? (
                 <div className="closed-section">
                    <h3>Auktionen är avslutad</h3>
                    {auction.winningBid ? (
                        <p>Vinnande bud: <strong>{auction.winningBid.amount} kr</strong> av <em>{auction.winningBid.username}</em></p>
                    ) : (
                        <p>Inga bud lades innan auktionen stängts</p>
                    )}
                 </div>
            ) : (
                <>
                    <h3>Budhistorik</h3>
                    {hasBids ? (
                        <table className="bid-history-table">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Användare</th>
                                    <th>Summa</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {auction.bids.map((bid, index) => {
                                    const isHighest = index === 0;
                                    const isMyBid = user && Number(user.id) === bid.userId;
                                    
                                    return (
                                        <tr key={bid.id}>
                                            <td>{formatLocalTime(bid.date)}</td>
                                            <td>{bid.username}</td>
                                            <td className="bid-amount">{bid.amount} kr</td>
                                            <td>
                                                {isHighest && isMyBid && (
                                                    <button onClick={() => handleRetractBid(bid.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8em' }}>Ångra</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>Inga bud har registrerats än</p>
                    )}
                </>
            )}
        </div>
    );
};

export default AuctionDetail;