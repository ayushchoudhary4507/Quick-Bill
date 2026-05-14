import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode token to get user info (simple version)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    username: payload.sub,
                    role: payload.role,
                    id: payload.id
                });

            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const data = await authApi.login(username, password);
        const { access_token } = data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        return data;
    };

    const register = async (username, password) => {
        const data = await authApi.register(username, password);
        return data;
    };


    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };


    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
