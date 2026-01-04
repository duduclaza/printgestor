import { useAuth } from '../contexts/AuthContext';

// Dados mock
const statsData = [
    { label: 'NCs Abertas', value: 12, color: 'var(--danger)', icon: '⚠️' },
    { label: 'Em Andamento', value: 8, color: 'var(--warning)', icon: '🔄' },
    { label: 'Solucionadas', value: 45, color: 'var(--success)', icon: '✅' },
    { label: 'Formulários NPS', value: 6, color: 'var(--accent)', icon: '📊' },
];

const recentNCs = [
    { id: 'NC-2024-001', title: 'Falha no processo de montagem', status: 'Pendente', date: '27/12/2024' },
    { id: 'NC-2024-002', title: 'Material fora de especificação', status: 'Em Andamento', date: '26/12/2024' },
    { id: 'NC-2024-003', title: 'Atraso na entrega de fornecedor', status: 'Solucionada', date: '25/12/2024' },
];

const recentNPS = [
    { form: 'Pesquisa de Satisfação', responses: 28, score: 8.5 },
    { form: 'Avaliação de Atendimento', responses: 15, score: 9.2 },
    { form: 'Feedback Pós-Venda', responses: 42, score: 7.8 },
];

export default function Dashboard() {
    const { user } = useAuth();

    const getStatusBadge = (status) => {
        const styles = {
            'Pendente': 'ios-badge-danger',
            'Em Andamento': 'ios-badge-warning',
            'Solucionada': 'ios-badge-success',
        };
        return styles[status] || '';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-[var(--text-tertiary)]">Visão geral do sistema</p>
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">
                    Olá, <span className="font-medium text-[var(--text-primary)]">{user?.name}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                    <div key={index} className="ios-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <div className="w-3 h-3 rounded-full" style={{ background: stat.color }}></div>
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                        <div className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent NCs */}
                <div className="ios-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--text-primary)]">Não Conformidades Recentes</h2>
                        <a href="/qualidade/nao-conformidades" className="text-sm text-[var(--accent)]">
                            Ver todas
                        </a>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {recentNCs.map((nc, index) => (
                            <div key={index} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                                <div>
                                    <div className="font-medium text-[var(--text-primary)]">{nc.id}</div>
                                    <div className="text-sm text-[var(--text-tertiary)]">{nc.title}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`ios-badge ${getStatusBadge(nc.status)}`}>
                                        {nc.status}
                                    </span>
                                    <div className="text-xs text-[var(--text-quaternary)] mt-1">{nc.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NPS Overview */}
                <div className="ios-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--text-primary)]">Formulários NPS</h2>
                        <a href="/qualidade/nps" className="text-sm text-[var(--accent)]">
                            Ver todos
                        </a>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {recentNPS.map((nps, index) => (
                            <div key={index} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                                <div>
                                    <div className="font-medium text-[var(--text-primary)]">{nps.form}</div>
                                    <div className="text-sm text-[var(--text-tertiary)]">{nps.responses} respostas</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${nps.score >= 9 ? 'text-[var(--success)]' :
                                            nps.score >= 7 ? 'text-[var(--warning)]' :
                                                'text-[var(--danger)]'
                                        }`}>
                                        {nps.score}
                                    </div>
                                    <div className="text-xs text-[var(--text-quaternary)]">média</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="ios-card p-5">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <a href="/qualidade/nao-conformidades" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Nova NC</span>
                    </a>
                    <a href="/qualidade/nps" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors">
                        <span className="text-2xl">📊</span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Formulário</span>
                    </a>
                    <a href="/qualidade/auditorias" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors">
                        <span className="text-2xl">🔍</span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Auditoria</span>
                    </a>
                    <a href="/cadastros/toners" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors">
                        <span className="text-2xl">💧</span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Toner</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
