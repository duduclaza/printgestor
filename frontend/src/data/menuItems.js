// Configuração de rotas do menu - SEM MÓDULOS ESPECIAIS
export const menuItems = [
    {
        label: 'Cadastros',
        icon: '📝',
        category: true,
        submenu: [
            { label: 'Produtos', href: '/cadastros/produtos', icon: '📦' },
            { label: 'Fornecedores', href: '/cadastros/fornecedores', icon: '🏭' },
            { label: 'Clientes', href: '/cadastros/clientes', icon: '👥' },
        ]
    },
    {
        label: 'Gestão da Qualidade',
        icon: '📋',
        category: true,
        submenu: [
            { label: 'Retornados', href: '/qualidade/retornados', icon: '📋' },
            { label: 'Amostragens', href: '/qualidade/amostragens', icon: '🔬' },
            { label: 'Descartes', href: '/qualidade/descartes', icon: '♻️' },
            { label: 'Homologações', href: '/qualidade/homologacoes', icon: '✅' },
            { label: 'Certificados', href: '/qualidade/certificados', icon: '📜' },
            { label: 'FMEA', href: '/qualidade/fmea', icon: '📈' },
            { label: 'POPs e ITs', href: '/qualidade/pops-its', icon: '📚' },
            { label: 'Fluxogramas', href: '/qualidade/fluxogramas', icon: '🔀' },
            { label: 'Auditorias', href: '/qualidade/auditorias', icon: '🔍' },
            { label: 'Não Conformidades', href: '/qualidade/nao-conformidades', icon: '⚠️' },
            { label: 'Melhoria Contínua', href: '/qualidade/melhoria-continua', icon: '🚀' },
            { label: 'Controle de RC', href: '/qualidade/controle-rc', icon: '🗂️' },
            { label: 'Garantias', href: '/qualidade/garantias', icon: '🛡️' },
            { label: 'Formulários NPS', href: '/qualidade/nps', icon: '📊' },
        ]
    },
    {
        label: 'Administrativo',
        icon: '⚙️',
        category: true,
        submenu: [
            { label: 'Usuários', href: '/admin/usuarios', icon: '👥' },
            { label: 'Perfis', href: '/admin/perfis', icon: '🎭' },
            { label: 'Solicitações', href: '/admin/solicitacoes', icon: '📧' },
            { label: 'Filiais', href: '/admin/filiais', icon: '🏢' },
            { label: 'Departamentos', href: '/admin/departamentos', icon: '🏛️' },
        ]
    },
];

export default menuItems;
