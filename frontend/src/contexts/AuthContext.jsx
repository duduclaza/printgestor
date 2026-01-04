import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';

const AuthContext = createContext(null);

// Usuário demo para desenvolvimento
const DEMO_USER = {
    id: 1,
    name: 'Admin Demo',
    email: 'admin@sgq.com',
    role: 'super_admin',
    profile: 'Administrador Master',
    avatar: null,
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carregar usuário do localStorage
    useEffect(() => {
        const savedUser = storage.get(STORAGE_KEYS.USER);
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    // Login
    const login = useCallback(async (email, password) => {
        // Simulação de login para desenvolvimento
        // Em produção, chamar API PHP
        return new Promise((resolve) => {
            setTimeout(() => {
                // Aceitar qualquer email/senha para demo
                if (email && password) {
                    const userData = {
                        ...DEMO_USER,
                        email,
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                    };
                    setUser(userData);
                    storage.set(STORAGE_KEYS.USER, userData);
                    storage.set(STORAGE_KEYS.AUTH, { token: 'demo-token', expiresAt: Date.now() + 86400000 });
                    resolve({ success: true, user: userData });
                } else {
                    resolve({ success: false, message: 'Email e senha são obrigatórios' });
                }
            }, 500);
        });
    }, []);

    // Logout
    const logout = useCallback(() => {
        setUser(null);
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.AUTH);
    }, []);

    // Verificar se é admin
    const isAdmin = useCallback(() => {
        return user && ['admin', 'super_admin'].includes(user.role);
    }, [user]);

    // Verificar se é super admin
    const isSuperAdmin = useCallback(() => {
        return user && user.role === 'super_admin';
    }, [user]);

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
