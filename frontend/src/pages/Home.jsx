import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Atualizações mock
const mockUpdates = [
    {
        type: 'Novidade',
        version: '2.0.0',
        date: '27/12/2024',
        title: 'Nova Interface iOS',
        description: 'Sistema completamente redesenhado com visual iOS moderno.',
        items: [
            'Suporte a Dark Mode e Light Mode',
            'Interface glassmorphism com backdrop blur',
            'Animações suaves e responsivas',
            'Menu simplificado e intuitivo',
        ]
    },
    {
        type: 'Correção',
        version: '1.9.5',
        date: '26/12/2024',
        title: 'Otimizações de Performance',
        description: 'Melhorias no carregamento e navegação.',
        items: [
            'Lazy loading de componentes',
            'Cache otimizado',
            'Transições mais suaves',
        ]
    },
];

export default function Home() {
    const { user } = useAuth();
    const [displayText, setDisplayText] = useState('');
    const fullText = 'Sistema de Gestão da Qualidade';

    // Efeito de digitação
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayText(fullText.substring(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="space-y-8 animate-fade-in">
            {/* Hero */}
            <div className="text-center py-8">
                <div className="w-24 h-24 bg-[var(--accent)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="text-5xl">📊</span>
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Print Gestor</h1>
                <p className="text-xl text-[var(--text-tertiary)] h-8">
                    {displayText}<span className="animate-pulse">|</span>
                </p>
            </div>

            {/* Welcome Card */}
            <div className="ios-card p-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--accent)] rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            Olá, {user?.name || 'Usuário'}!
                        </h2>
                        <p className="text-[var(--text-tertiary)]">
                            Perfil: <span className="text-[var(--accent)] font-medium">{user?.profile || user?.role || 'Usuário'}</span>
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-[var(--text-secondary)]">
                    Utilize o menu lateral para navegar pelos módulos disponíveis.
                </p>
            </div>

            {/* Updates */}
            <div className="ios-card max-w-4xl mx-auto overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🔔</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Últimas Atualizações</h3>
                </div>

                <div className="divide-y divide-[var(--border)]">
                    {mockUpdates.map((update, index) => (
                        <div key={index} className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`ios-badge ${update.type === 'Novidade' ? 'ios-badge-primary' : 'ios-badge-warning'}`}>
                                    {update.type}
                                </span>
                                <span className="text-sm text-[var(--text-tertiary)]">v{update.version}</span>
                                <span className="text-sm text-[var(--text-quaternary)]">•</span>
                                <span className="text-sm text-[var(--text-tertiary)]">{update.date}</span>
                            </div>

                            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{update.title}</h4>
                            <p className="text-[var(--text-secondary)] text-sm mb-3">{update.description}</p>

                            <ul className="space-y-2">
                                {update.items.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                        <span className="text-[var(--success)]">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
