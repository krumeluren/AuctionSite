import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const evaluateToken = (token, username) => {
        const decoded = decodeJwt(token);
        
        if (!decoded) {
            logout();
            return;
        }

        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
            logout();
            return;
        }

        const roleClaimUri = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
        const idClaimUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        
        const extractedId = decoded[idClaimUri] || decoded.nameid || decoded.sub;
        
        const roles = decoded[roleClaimUri] || decoded.role;
        let isAdmin = false;

        if (Array.isArray(roles)) {
            isAdmin = roles.includes("Admin");
        } else if (typeof roles === 'string') {
            isAdmin = roles === "Admin";
        }

        setUser({ 
            token, 
            username, 
            id: Number(extractedId),
            isAdmin: isAdmin 
        });
    };

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        const username = localStorage.getItem('username');

        if (token && username) {
            evaluateToken(token, username);
        } else {
            setLoading(false);
        }
    }, []);

    const login = (authData) => {
        localStorage.setItem('jwt_token', authData.token);
        localStorage.setItem('username', authData.username);
        
        evaluateToken(authData.token, authData.username);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
        setUser(null);
    };

    if (loading && !user) {
        return null; 
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);