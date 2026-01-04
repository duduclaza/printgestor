import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { menuItems } from '../../data/menuItems';

// Ícones SVG minimalistas
const Icons = {
    home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
    ),
    box: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    clipboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    sun: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    moon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    ),
    chevron: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    collapse: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
    ),
    expand: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
    ),
};

// Mapeamento de categoria para ícone
const categoryIcons = {
    'Cadastros': Icons.box,
    'Gestão da Qualidade': Icons.clipboard,
    'Administrativo': Icons.settings,
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});
    const [isCompact, setIsCompact] = useState(false);

    const toggleMenu = (label) => {
        if (isCompact) {
            setIsCompact(false);
        }
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const toggleCompact = () => {
        setIsCompact(!isCompact);
        if (!isCompact) {
            setExpandedMenus({});
        }
    };

    return (
        <aside className={`hidden lg:flex flex-col h-screen bg-[#171717] border-r border-[#2f2f2f] transition-all duration-300 ${isCompact ? 'w-16' : 'w-64'}`}>
            {/* Logo */}
            <div className={`h-14 flex items-center ${isCompact ? 'justify-center px-2' : 'justify-between px-4'}`}>
                {!isCompact && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="text-white font-medium">Print Gestor</span>
                    </div>
                )}

                {isCompact && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                )}

                {!isCompact && (
                    <button
                        onClick={toggleCompact}
                        className="p-2 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-colors"
                        title="Compactar menu"
                    >
                        {Icons.collapse}
                    </button>
                )}
            </div>

            {/* Menu Principal */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
                {/* Início */}
                <NavLink
                    to="/"
                    title="Início"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isCompact ? 'justify-center' : ''} ${isActive
                            ? 'bg-white/10 text-white'
                            : 'text-[#ececec] hover:bg-white/5'
                        }`
                    }
                >
                    {Icons.home}
                    {!isCompact && <span>Início</span>}
                </NavLink>

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    title="Dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isCompact ? 'justify-center' : ''} ${isActive
                            ? 'bg-white/10 text-white'
                            : 'text-[#ececec] hover:bg-white/5'
                        }`
                    }
                >
                    {Icons.dashboard}
                    {!isCompact && <span>Dashboard</span>}
                </NavLink>

                {/* Seções */}
                {menuItems.map(category => (
                    <div key={category.label} className="mt-4">
                        {/* Header da Seção */}
                        <button
                            onClick={() => toggleMenu(category.label)}
                            title={category.label}
                            className={`w-full flex items-center ${isCompact ? 'justify-center px-3 py-2.5' : 'justify-between px-3 py-2'} text-xs font-medium text-[#8e8e8e] uppercase tracking-wider hover:text-white transition-colors rounded-lg hover:bg-white/5`}
                        >
                            {isCompact ? (
                                categoryIcons[category.label] || Icons.box
                            ) : (
                                <>
                                    <span>{category.label}</span>
                                    <span className={`transform transition-transform duration-200 ${expandedMenus[category.label] ? 'rotate-180' : ''}`}>
                                        {Icons.chevron}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Submenu */}
                        {!isCompact && (
                            <div className={`overflow-hidden transition-all duration-200 ${expandedMenus[category.label] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                {category.submenu.map(item => (
                                    <NavLink
                                        key={item.label}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 ml-2 rounded-lg text-sm transition-colors ${isActive
                                                ? 'bg-white/10 text-white'
                                                : 'text-[#b4b4b4] hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Rodapé */}
            <div className={`p-3 border-t border-[#2f2f2f] ${isCompact ? 'flex flex-col items-center gap-2' : ''}`}>
                {/* Botões de ação em modo compacto */}
                {isCompact ? (
                    <>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-colors"
                            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                        >
                            {isDark ? Icons.sun : Icons.moon}
                        </button>
                        <button
                            onClick={toggleCompact}
                            className="p-2 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-colors"
                            title="Expandir menu"
                        >
                            {Icons.expand}
                        </button>
                        <NavLink
                            to="/profile"
                            className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-semibold text-sm"
                            title={user?.name || 'Perfil'}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </NavLink>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-[#8e8e8e] hover:text-red-400 hover:bg-white/5 transition-colors"
                            title="Sair"
                        >
                            {Icons.logout}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Linha de ações */}
                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-colors"
                                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                            >
                                {isDark ? Icons.sun : Icons.moon}
                            </button>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3">
                            <NavLink to="/profile" className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </NavLink>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{user?.name || 'Usuário'}</div>
                                <div className="text-xs text-[#8e8e8e] truncate">{user?.role || 'user'}</div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-[#8e8e8e] hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Sair"
                            >
                                {Icons.logout}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}
