import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout
import AppLayout from './components/Layout/AppLayout';

// Pages
import Login from './pages/Auth/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Cadastros/Produtos';
import Clientes from './pages/Cadastros/Clientes';

// Coming Soon Placeholder
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="ios-card p-12 text-center max-w-md">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h1>
        <p className="text-[var(--text-tertiary)]">Este módulo está em desenvolvimento.</p>
        <p className="text-sm text-[var(--text-quaternary)] mt-2">Em breve estará disponível!</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Cadastros */}
                <Route path="cadastros/produtos" element={<Produtos />} />
                <Route path="cadastros/fornecedores" element={<ComingSoon title="Fornecedores" />} />
                <Route path="cadastros/clientes" element={<Clientes />} />

                {/* Qualidade */}
                <Route path="qualidade/retornados" element={<ComingSoon title="Retornados" />} />
                <Route path="qualidade/amostragens" element={<ComingSoon title="Amostragens" />} />
                <Route path="qualidade/descartes" element={<ComingSoon title="Descartes" />} />
                <Route path="qualidade/homologacoes" element={<ComingSoon title="Homologações" />} />
                <Route path="qualidade/certificados" element={<ComingSoon title="Certificados" />} />
                <Route path="qualidade/fmea" element={<ComingSoon title="FMEA" />} />
                <Route path="qualidade/pops-its" element={<ComingSoon title="POPs e ITs" />} />
                <Route path="qualidade/fluxogramas" element={<ComingSoon title="Fluxogramas" />} />
                <Route path="qualidade/auditorias" element={<ComingSoon title="Auditorias" />} />
                <Route path="qualidade/nao-conformidades" element={<ComingSoon title="Não Conformidades" />} />
                <Route path="qualidade/melhoria-continua" element={<ComingSoon title="Melhoria Contínua" />} />
                <Route path="qualidade/controle-rc" element={<ComingSoon title="Controle de RC" />} />
                <Route path="qualidade/garantias" element={<ComingSoon title="Garantias" />} />
                <Route path="qualidade/nps" element={<ComingSoon title="Formulários NPS" />} />

                {/* Admin */}
                <Route path="admin/usuarios" element={<ComingSoon title="Usuários" />} />
                <Route path="admin/perfis" element={<ComingSoon title="Perfis" />} />
                <Route path="admin/solicitacoes" element={<ComingSoon title="Solicitações" />} />
                <Route path="admin/filiais" element={<ComingSoon title="Filiais" />} />
                <Route path="admin/departamentos" element={<ComingSoon title="Departamentos" />} />

                {/* Profile */}
                <Route path="profile" element={<ComingSoon title="Meu Perfil" />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
