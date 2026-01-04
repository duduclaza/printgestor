import { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/formatters';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    // Adicionar toast
    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = generateId();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto remover após duração
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    // Remover toast
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Atalhos
    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// Container de toasts
function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white',
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${colors[toast.type] || colors.info}`}
                >
                    <span className="text-lg">{icons[toast.type] || icons.info}</span>
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default ToastContext;
