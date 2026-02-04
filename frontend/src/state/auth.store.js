/**
 * Auth State Store
 */

import { useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/auth.api';

// Simple global state
let globalUser = null;
let listeners = [];

const notify = () => {
    listeners.forEach((listener) => listener(globalUser));
};

export const useAuth = () => {
    const [user, setUser] = useState(globalUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listeners.push(setUser);
        return () => {
            listeners = listeners.filter((l) => l !== setUser);
        };
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            if (authApi.isAuthenticated()) {
                try {
                    const userData = await authApi.getMe();
                    globalUser = userData;
                    notify();
                } catch (error) {
                    console.error('Auth check failed:', error);
                    globalUser = null;
                    notify();
                }
            }
            setLoading(false);
        };

        if (!globalUser && authApi.isAuthenticated()) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password, mfaCode = null) => {
        const response = await authApi.login(email, password, mfaCode);
        if (response && response.user) {
            globalUser = response.user;
            notify();
        }
        return response;
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        globalUser = null;
        notify();
    }, []);

    const register = useCallback(async (email, username, password) => {
        return authApi.register(email, username, password);
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
    };
};

export default useAuth;
