import { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Verificar preferência salva ou do sistema
        const saved = storage.get(STORAGE_KEYS.SETTINGS)?.theme;
        if (saved) return saved;

        // Verificar preferência do sistema
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Aplicar tema ao documento
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Salvar preferência
        const settings = storage.get(STORAGE_KEYS.SETTINGS) || {};
        storage.set(STORAGE_KEYS.SETTINGS, { ...settings, theme });
    }, [theme]);

    // Toggle tema
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
