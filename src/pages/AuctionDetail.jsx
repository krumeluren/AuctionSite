import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
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
            const data = await apiFetch(`/Auctions/${id}`);
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
            await apiFetch('/Bids', {
                method: 'POST',
                body: JSON.stringify({ auctionId: Number(id), amount: numericAmount })
            });
            setBidAmount('');
            await fetchAuction();
        } catch (err) {
            setBidError(err.message);
        }
    };

    const handleRetractBid = async (bidId) => {
        try {
            await apiFetch(`/Bids/${bidId}`, { method: 'DELETE' });
            await fetchAuction();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateAuction = async (e) => {
        e.preventDefault();
        setUpdateError(null);
        try {
            await apiFetch(`/Auctions/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: updateTitle,
                    description: updateDescription,
                    startingPrice: parseFloat(updateStartingPrice)
                })
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
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#0066cc' }}>
                &larr; Tillbaka till listan
            </Link>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px', marginBottom: '20px', background: auction.isActive ? 'white' : '#ffe6e6' }}>
                {!auction.isActive && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>[INAKTIVERAD AV ADMINISTRATÖR]</div>}
                
                {isEditing ? (
                    <form onSubmit={handleUpdateAuction}>
                        {updateError && <div style={{ color: 'red', marginBottom: '10px' }}>{updateError}</div>}
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Titel</label>
                            <input value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Beskrivning</label>
                            <textarea value={updateDescription} onChange={(e) => setUpdateDescription(e.target.value)} required rows="4" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Startpris</label>
                            <input type="number" value={updateStartingPrice} onChange={(e) => setUpdateStartingPrice(e.target.value)} disabled={hasBids} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: hasBids ? '#eee' : 'white' }}/>
                            {hasBids && <small style={{ display: 'block', color: '#555', marginTop: '5px' }}>Startpris kan ej ändras (bud existerar).</small>}
                        </div>

                        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Spara ändringar</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginLeft: '10px' }}>Avbryt</button>
                    </form>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 style={{ marginTop: 0 }}>{auction.title}</h1>
                            {
                            isCreator && auction.isOpen && (
                                <button onClick={() => setIsEditing(true)} style={{ padding: '8px 15px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Redigera</button>
                            )}
                        </div>
                        <p style={{ fontSize: '1.1em' }}>{auction.description}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', background: '#f9f9f9', padding: '15px' }}>
                            <div><strong>Startpris:</strong> {auction.startingPrice} kr</div>
                            <div style={{ color: '#0066cc' }}><strong>Aktuellt pris:</strong> {auction.currentPrice} kr</div>
                            <div><strong>Startdatum:</strong> {formatLocalTime(auction.startDate)}</div>
                            <div><strong>Slutdatum:</strong> {formatLocalTime(auction.endDate)}</div>
                            <div><strong>Säljare:</strong> {auction.creatorUsername}</div>
                            <div>
                                <strong>Status:</strong> 
                                <span style={{ color: auction.isOpen ? 'green' : 'red', fontWeight: 'bold', marginLeft: '5px' }}>
                                    {auction.isOpen ? 'Öppen' : 'Avslutad'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {auction.isOpen && user && !isCreator && auction.isActive && (
                <div style={{ border: '1px solid #b3d4fc', background: '#e6f2ff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                    <h3 style={{ marginTop: 0 }}>Lägg ett bud</h3>
                    {bidError && <div style={{ color: 'red', marginBottom: '10px' }}>{bidError}</div>}
                    
                    <form onSubmit={handleBidSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            min={auction.currentPrice + 1}
                            step="1"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                            style={{ padding: '8px', flex: 1 }}
                        />
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Bekräfta bud</button>
                    </form>
                </div>
            )}

            {!auction.isOpen ? (
                 <div style={{ padding: '20px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '4px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Auktionen är avslutad</h3>
                    {auction.winningBid ? (
                        <p>Vinnande bud: <strong>{auction.winningBid.amount} kr</strong> av <em>{auction.winningBid.username}</em></p>
                    ) : (
                        <p>Inga bud lades innan auktionen stängdes</p>
                    )}
                 </div>
            ) : (
                <>
                    <h3>Budhistorik</h3>
                    {hasBids ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#eee' }}>
                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Datum</th>
                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Användare</th>
                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Summa</th>
                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {auction.bids.map((bid, index) => {
                                    const isHighest = index === 0;
                                    const isMyBid = user && Number(user.id) === bid.userId;
                                    
                                    return (
                                        <tr key={bid.id}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{formatLocalTime(bid.date)}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{bid.username}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{bid.amount} kr</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                                {isHighest && isMyBid && (
                                                    <button onClick={() => handleRetractBid(bid.id)} style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontSize: '0.8em' }}>Ångra</button>
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