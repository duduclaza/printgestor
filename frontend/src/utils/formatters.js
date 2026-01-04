import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatar data para exibição
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
    if (!date) return '-';
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        return format(parsed, pattern, { locale: ptBR });
    } catch {
        return '-';
    }
};

// Formatar data e hora
export const formatDateTime = (date) => {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
};

// Tempo relativo (ex: "há 2 horas")
export const formatRelativeTime = (date) => {
    if (!date) return '-';
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(parsed, { addSuffix: true, locale: ptBR });
    } catch {
        return '-';
    }
};

// Formatar moeda
export const formatCurrency = (value, currency = 'BRL') => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(value);
};

// Formatar número
export const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

// Formatar porcentagem
export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    return `${formatNumber(value, decimals)}%`;
};

// Truncar texto
export const truncate = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Capitalizar primeira letra
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Gerar ID único
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
