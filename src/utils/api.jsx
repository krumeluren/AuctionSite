const BASE_URL = 'http://localhost:5262/api';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('jwt_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP-error: ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    return response.json();
};

export class AuctionAPI {
    static async getAuctions(query = '') {
        const endpoint = query 
            ? `/Auctions?search=${encodeURIComponent(query)}` 
            : '/Auctions';
        return await apiFetch(endpoint);
    }

    static async toggleUserStatus(userId) {
        return await apiFetch(`/Users/admin/toggle/${userId}`, { method: 'PUT' });
    }
    static async getUsers() {
        return await apiFetch('/Users');
    }
    static async createAuction(auctionData) {
        return await apiFetch('/Auctions', {
            method: 'POST',
            body: JSON.stringify(auctionData)
        });
    }
    static async getAuctionById(id) {
        return await apiFetch(`/Auctions/${id}`);
    }
    static async updateAuction(id, auctionData) {
        return await apiFetch(`/Auctions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(auctionData)
        });
    }
    static async placeBid(auctionId, amount) {
        return await apiFetch('/Bids', {
            method: 'POST',
            body: JSON.stringify({ auctionId: Number(auctionId), amount })
        });
    }
    static async retractBid(bidId) {
        return await apiFetch(`/Bids/${bidId}`, { method: 'DELETE' });
    }
    static async login(endpoint, payload) {
        return await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
    static async register(endpoint, payload) {
        return await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
    static async changePassword(payload) {
        return await apiFetch('/Users/password', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }
}