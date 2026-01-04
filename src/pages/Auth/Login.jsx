import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const { error: showError } = useToast();
    const navigate = useNavigate();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/');
            } else {
                showError(result.message || 'Erro ao fazer login');
            }
        } catch {
            showError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 transition-colors">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-3 rounded-2xl bg-[var(--bg-secondary)] shadow-lg border border-[var(--border)] hover:scale-105 transition-transform"
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className="w-full max-w-md animate-scale-in">
                {/* Card */}
                <div className="ios-card p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-[var(--accent)] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-3xl">📊</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Print Gestor</h1>
                        <p className="text-[var(--text-tertiary)] mt-1">Sistema de Gestão da Qualidade</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="ios-input"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="ios-input pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full ios-btn ios-btn-primary py-4 text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Entrando...
                                </span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-3">
                        <a href="/forgot-password" className="block text-[var(--accent)] hover:underline">
                            Esqueci minha senha
                        </a>
                        <a href="/request-access" className="ios-btn ios-btn-secondary w-full">
                            Solicitar Acesso
                        </a>
                    </div>

                    {/* Demo info */}
                    <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-2xl text-center">
                        <p className="text-sm text-[var(--text-tertiary)]">
                            <span className="font-semibold text-[var(--text-secondary)]">Modo Demo:</span> Use qualquer email e senha
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
