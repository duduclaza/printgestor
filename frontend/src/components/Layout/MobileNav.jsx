import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { menuItems } from '../../data/menuItems';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <div className="lg:hidden">
            {/* Header Mobile */}
            <div className="h-14 flex items-center justify-between px-4 bg-[#171717] border-b border-[#2f2f2f]">
                <button onClick={toggleMenu} className="p-2 rounded-lg text-white hover:bg-white/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <span className="text-white font-medium">Print Gestor</span>

                <button onClick={toggleTheme} className="p-2 rounded-lg text-[#8e8e8e] hover:text-white">
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40" onClick={closeMenu} />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-[#171717] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-[#2f2f2f]">
                    <span className="text-white font-medium">Menu</span>
                    <button onClick={closeMenu} className="p-2 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-white/5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
                    <NavLink
                        to="/"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-[#ececec] hover:bg-white/5'}`
                        }
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Início</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-[#ececec] hover:bg-white/5'}`
                        }
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        <span>Dashboard</span>
                    </NavLink>

                    {/* Categories */}
                    {menuItems.map(category => (
                        <div key={category.label} className="mt-4">
                            <div className="px-3 py-2 text-xs font-medium text-[#8e8e8e] uppercase tracking-wider">
                                {category.label}
                            </div>
                            {category.submenu?.map(item => (
                                <NavLink
                                    key={item.label}
                                    to={item.href}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 ml-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-[#b4b4b4] hover:bg-white/5 hover:text-white'}`
                                    }
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#2f2f2f] bg-[#171717]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-semibold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{user?.name}</div>
                            <div className="text-xs text-[#8e8e8e]">{user?.role}</div>
                        </div>
                        <button
                            onClick={() => { logout(); closeMenu(); }}
                            className="p-2 rounded-lg text-[#8e8e8e] hover:text-red-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
