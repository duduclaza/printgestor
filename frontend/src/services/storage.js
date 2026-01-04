// Chaves de armazenamento local
const STORAGE_KEYS = {
    AUTH: 'sgq_auth',
    USER: 'sgq_user',
    NPS_FORMS: 'sgq_nps_forms',
    NPS_RESPONSES: 'sgq_nps_responses',
    NCS: 'sgq_ncs',
    TONERS: 'sgq_toners',
    MAQUINAS: 'sgq_maquinas',
    PECAS: 'sgq_pecas',
    FORNECEDORES: 'sgq_fornecedores',
    CLIENTES: 'sgq_clientes',
    GARANTIAS: 'sgq_garantias',
    AUDITORIAS: 'sgq_auditorias',
    SETTINGS: 'sgq_settings',
    PRODUTOS: 'sgq_produtos',
};

// Funções de armazenamento
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    clear: () => {
        try {
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
            return true;
        } catch {
            return false;
        }
    }
};

export { STORAGE_KEYS };
export default storage;
