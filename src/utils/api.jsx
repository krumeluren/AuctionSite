const BASE_URL = ' http://localhost:5262/api'; // backend url/port

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

    // if the response has no content, return null instead of trying to parse JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    return response.json();
};