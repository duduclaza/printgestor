import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { storage, STORAGE_KEYS } from '../../services/storage';
import * as XLSX from 'xlsx';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    BuildingOffice2Icon,
    CheckIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    DocumentArrowDownIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';

// Constantes
const TIPOS_CADASTRO = ['Matriz', 'Filial'];
const SITUACOES = ['Ativo', 'Inativo', 'Bloqueado'];
const REGIMES_TRIBUTARIOS = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI'];
const PORTES_EMPRESA = ['MEI', 'ME', 'EPP', 'Empresa de Pequeno Porte', 'Média Empresa', 'Grande Empresa'];
const TIPOS_CONTRIBUINTE = ['Contribuinte ICMS', 'Isento', 'Não Contribuinte'];
const INDICADORES_IE = ['1 - Contribuinte', '2 - Isento', '9 - Não Contribuinte'];
const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const FORMAS_PAGAMENTO = ['Boleto', 'Cartão Crédito', 'Cartão Débito', 'PIX', 'Transferência', 'Dinheiro', 'Cheque'];
const CATEGORIAS_CLIENTE = ['Escritório', 'Indústria', 'Comércio', 'Serviços', 'Governo', 'Educação', 'Saúde', 'Outros'];

const TEMPLATE_COLUMNS = [
    'Nome Fantasia', 'Razão Social', 'Tipo Cadastro', 'CNPJ', 'Inscrição Estadual', 'IE Isento',
    'CEP', 'Logradouro', 'Número', 'Bairro', 'Cidade', 'Estado',
    'Contato Nome', 'Contato Telefone', 'Contato Email', 'Situação'
];

const INITIAL_FORM = {
    // Dados empresa
    nomeFantasia: '', razaoSocial: '', tipoCadastro: 'Matriz', codigoInterno: '', cnpj: '',
    inscricaoEstadual: '', ieIsento: false, inscricaoMunicipal: '', cnae: '',
    regimeTributario: '', porteEmpresa: '', dataAbertura: '', situacao: 'Ativo',
    // Fiscal
    ufCadastro: '', tipoContribuinte: '', consumidorFinal: false, indicadorIE: '', suframa: '', obsFiscais: '',
    // Endereço sede
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: 'Brasil',
    // Endereço entrega
    entregaMesmoEndereco: true, entregaCep: '', entregaLogradouro: '', entregaNumero: '',
    entregaComplemento: '', entregaBairro: '', entregaCidade: '', entregaEstado: '',
    // Endereço cobrança
    cobrancaMesmoEndereco: true, cobrancaCep: '', cobrancaLogradouro: '', cobrancaNumero: '',
    cobrancaComplemento: '', cobrancaBairro: '', cobrancaCidade: '', cobrancaEstado: '',
    // Contato comercial
    contatoNome: '', contatoCargo: '', contatoTelefone: '', contatoWhatsapp: '', contatoEmail: '',
    // Contato financeiro
    financeiroNome: '', financeiroEmail: '', financeiroTelefone: '',
    // Condições comerciais
    formaPagamento: '', prazoPagamento: '', limiteCredito: '', politicaDesconto: '',
    tabelaPreco: '', permiteVendaPrazo: false,
    // Acesso B2B
    usuario: '', senha: '',
    // Internos
    observacoes: '', categoria: '', regiaoRota: '',
};

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSituacao, setFilterSituacao] = useState('');
    const [importData, setImportData] = useState([]);
    const [importStep, setImportStep] = useState(1);
    const [expandedSections, setExpandedSections] = useState({
        empresa: true, fiscal: false, enderecoSede: false, enderecoEntrega: false,
        enderecoCobranca: false, contatoComercial: false, contatoFinanceiro: false,
        condicoesComerciais: false, acessoB2B: false, internos: false
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        setClientes(storage.get(STORAGE_KEYS.CLIENTES) || []);
    }, []);

    const saveClientes = (newClientes) => {
        storage.set(STORAGE_KEYS.CLIENTES, newClientes);
        setClientes(newClientes);
    };

    const getNextCodigo = () => {
        const codigos = clientes.map((c) => parseInt(c.codigoInterno, 10)).filter((n) => !isNaN(n));
        return String((codigos.length > 0 ? Math.max(...codigos) : 0) + 1).padStart(5, '0');
    };

    const clientesFiltrados = useMemo(() => {
        return clientes.filter((c) => {
            const matchSearch = c.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cnpj?.includes(searchTerm) ||
                c.codigoInterno?.includes(searchTerm);
            return matchSearch && (!filterSituacao || c.situacao === filterSituacao);
        });
    }, [clientes, searchTerm, filterSituacao]);

    const handleNew = () => {
        setForm({ ...INITIAL_FORM, codigoInterno: getNextCodigo() });
        setEditingId(null);
        setExpandedSections({ empresa: true, fiscal: false, enderecoSede: false, enderecoEntrega: false, enderecoCobranca: false, contatoComercial: false, contatoFinanceiro: false, condicoesComerciais: false, acessoB2B: false, internos: false });
        setShowModal(true);
    };

    const handleEdit = (cliente) => {
        setForm({ ...INITIAL_FORM, ...cliente });
        setEditingId(cliente.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Deseja realmente excluir este cliente?')) {
            saveClientes(clientes.filter((c) => c.id !== id));
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'ieIsento' && value) updated.inscricaoEstadual = 'ISENTO';
            if (field === 'entregaMesmoEndereco' && value) {
                updated.entregaCep = prev.cep; updated.entregaLogradouro = prev.logradouro;
                updated.entregaNumero = prev.numero; updated.entregaComplemento = prev.complemento;
                updated.entregaBairro = prev.bairro; updated.entregaCidade = prev.cidade;
                updated.entregaEstado = prev.estado;
            }
            if (field === 'cobrancaMesmoEndereco' && value) {
                updated.cobrancaCep = prev.cep; updated.cobrancaLogradouro = prev.logradouro;
                updated.cobrancaNumero = prev.numero; updated.cobrancaComplemento = prev.complemento;
                updated.cobrancaBairro = prev.bairro; updated.cobrancaCidade = prev.cidade;
                updated.cobrancaEstado = prev.estado;
            }
            return updated;
        });
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const buscarCep = async (cep, prefix = '') => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setForm(prev => ({
                    ...prev,
                    [`${prefix}logradouro`]: data.logradouro || '',
                    [`${prefix}bairro`]: data.bairro || '',
                    [`${prefix}cidade`]: data.localidade || '',
                    [`${prefix}estado`]: data.uf || '',
                }));
            }
        } catch (err) { console.error('Erro ao buscar CEP:', err); }
    };

    const handleSave = () => {
        if (!form.nomeFantasia.trim()) return alert('Nome Fantasia é obrigatório!');
        const clienteData = {
            ...form,
            id: editingId || Date.now(),
            updatedAt: new Date().toISOString(),
            createdAt: editingId ? form.createdAt : new Date().toISOString(),
        };
        saveClientes(editingId ? clientes.map((c) => (c.id === editingId ? clienteData : c)) : [...clientes, clienteData]);
        setShowModal(false);
    };

    // Import functions
    const openImportModal = () => { setImportData([]); setImportStep(1); setShowImportModal(true); };

    const downloadTemplate = () => {
        try {
            const exampleRow = ['Empresa Exemplo', 'Empresa Exemplo LTDA', 'Matriz', '00.000.000/0001-00', '123456789', 'N', '01310-100', 'Av Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', 'João Silva', '11999999999', 'joao@email.com', 'Ativo'];
            const wsData = [TEMPLATE_COLUMNS, exampleRow];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 20 }));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = 'template_clientes.xlsx';
            document.body.appendChild(link); link.click();
            document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch (error) { console.error('Erro:', error); alert('Erro ao gerar template.'); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const cnpjsExistentes = clientes.map(c => c.cnpj);
            const cnpjsNaImportacao = [];
            const converted = jsonData.map((row, i) => {
                const cnpj = row['CNPJ']?.toString() || '';
                const duplicado = cnpj && (cnpjsExistentes.includes(cnpj) || cnpjsNaImportacao.includes(cnpj));
                if (cnpj) cnpjsNaImportacao.push(cnpj);
                return {
                    nomeFantasia: row['Nome Fantasia'] || '', razaoSocial: row['Razão Social'] || '',
                    tipoCadastro: row['Tipo Cadastro'] || 'Matriz', cnpj, inscricaoEstadual: row['Inscrição Estadual'] || '',
                    ieIsento: row['IE Isento'] === 'S', cep: row['CEP'] || '', logradouro: row['Logradouro'] || '',
                    numero: row['Número']?.toString() || '', bairro: row['Bairro'] || '', cidade: row['Cidade'] || '',
                    estado: row['Estado'] || '', contatoNome: row['Contato Nome'] || '',
                    contatoTelefone: row['Contato Telefone']?.toString() || '', contatoEmail: row['Contato Email'] || '',
                    situacao: row['Situação'] || 'Ativo', _valid: !!row['Nome Fantasia'] && !duplicado,
                    _duplicado: duplicado, _row: i + 2
                };
            }).filter(c => c.nomeFantasia);
            setImportData(converted);
            setImportStep(2);
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const confirmImport = () => {
        const valid = importData.filter(c => c._valid);
        if (!valid.length) return alert('Nenhum cliente válido!');
        const newClientes = valid.map((c, i) => {
            const { _valid, _duplicado, _row, ...data } = c;
            return { ...INITIAL_FORM, ...data, id: Date.now() + i, codigoInterno: getNextCodigo(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        });
        saveClientes([...clientes, ...newClientes]);
        setShowImportModal(false);
        alert(`${newClientes.length} cliente(s) importado(s)!`);
    };

    // Section Header Component
    const SectionHeader = ({ title, icon, section }) => (
        <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--bg-tertiary)]/80 transition-colors">
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <span>{icon}</span> {title}
            </span>
            {expandedSections[section] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </button>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clientes</h1>
                    <p className="text-[var(--text-tertiary)] mt-1">Gerencie clientes e empresas</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openImportModal} className="ios-btn ios-btn-secondary">
                        <ArrowUpTrayIcon className="w-5 h-5" /> Importar Excel
                    </button>
                    <button onClick={handleNew} className="ios-btn ios-btn-primary">
                        <PlusIcon className="w-5 h-5" /> Novo Cliente
                    </button>
                </div>
            </div>

            {/* Busca e Filtros */}
            <div className="ios-card p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input type="text" placeholder="Buscar por nome, razão social, CNPJ ou código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ios-input pr-10 bg-[var(--bg-secondary)]" />
                        <MagnifyingGlassIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-tertiary)] hidden sm:block mr-2">Situação:</span>
                        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-xl">
                            <button onClick={() => setFilterSituacao('')} className={`w-20 py-2 rounded-lg text-sm font-medium transition-all ${!filterSituacao ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>Todos</button>
                            {SITUACOES.map((s) => (
                                <button key={s} onClick={() => setFilterSituacao(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterSituacao === s ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="ios-card overflow-hidden">
                {clientesFiltrados.length === 0 ? (
                    <div className="p-16 text-center">
                        <BuildingOffice2Icon className="w-16 h-16 mx-auto text-[var(--text-quaternary)] mb-4" />
                        <p className="text-[var(--text-tertiary)]">Nenhum cliente cadastrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Código</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Nome Fantasia</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">CNPJ</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Cidade/UF</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Contato</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Situação</th>
                                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.map((c) => (
                                    <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors">
                                        <td className="p-4 font-mono text-sm">{c.codigoInterno}</td>
                                        <td className="p-4">
                                            <div className="font-medium">{c.nomeFantasia}</div>
                                            {c.razaoSocial && <span className="text-xs text-[var(--text-tertiary)]">{c.razaoSocial}</span>}
                                        </td>
                                        <td className="p-4 text-sm">{c.cnpj || '-'}</td>
                                        <td className="p-4 text-sm">{c.cidade && c.estado ? `${c.cidade}/${c.estado}` : '-'}</td>
                                        <td className="p-4 text-sm">
                                            {c.contatoNome && <div>{c.contatoNome}</div>}
                                            {c.contatoTelefone && <span className="text-xs text-[var(--text-tertiary)]">{c.contatoTelefone}</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.situacao === 'Ativo' ? 'bg-green-500/20 text-green-400' : c.situacao === 'Inativo' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>{c.situacao}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--accent)]"><PencilSquareIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-[var(--danger)]/10 text-[var(--danger)]"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Novo/Editar */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
                        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Dados da Empresa */}
                            <div className="space-y-4">
                                <SectionHeader title="Dados da Empresa" icon="🏢" section="empresa" />
                                {expandedSections.empresa && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nome Fantasia *</label><input type="text" value={form.nomeFantasia} onChange={(e) => handleChange('nomeFantasia', e.target.value)} className="ios-input" placeholder="Nome fantasia" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Razão Social</label><input type="text" value={form.razaoSocial} onChange={(e) => handleChange('razaoSocial', e.target.value)} className="ios-input" placeholder="Razão social" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tipo Cadastro</label><select value={form.tipoCadastro} onChange={(e) => handleChange('tipoCadastro', e.target.value)} className="ios-input">{TIPOS_CADASTRO.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Código Interno</label><input type="text" value={form.codigoInterno} onChange={(e) => handleChange('codigoInterno', e.target.value)} className="ios-input" placeholder="00001" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Situação</label><select value={form.situacao} onChange={(e) => handleChange('situacao', e.target.value)} className="ios-input">{SITUACOES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CNPJ</label><input type="text" value={form.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} className="ios-input" placeholder="00.000.000/0001-00" /></div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Inscrição Estadual</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={form.inscricaoEstadual} onChange={(e) => handleChange('inscricaoEstadual', e.target.value)} disabled={form.ieIsento} className="ios-input flex-1" placeholder="Inscrição estadual" />
                                                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap px-3">
                                                        <div className={`ios-toggle ${form.ieIsento ? 'active' : ''}`} onClick={() => handleChange('ieIsento', !form.ieIsento)} />
                                                        <span className="text-sm">Isento</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Inscrição Municipal</label><input type="text" value={form.inscricaoMunicipal} onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CNAE</label><input type="text" value={form.cnae} onChange={(e) => handleChange('cnae', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Data Abertura</label><input type="date" value={form.dataAbertura} onChange={(e) => handleChange('dataAbertura', e.target.value)} className="ios-input" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Regime Tributário</label><select value={form.regimeTributario} onChange={(e) => handleChange('regimeTributario', e.target.value)} className="ios-input"><option value="">Selecione...</option>{REGIMES_TRIBUTARIOS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Porte da Empresa</label><select value={form.porteEmpresa} onChange={(e) => handleChange('porteEmpresa', e.target.value)} className="ios-input"><option value="">Selecione...</option>{PORTES_EMPRESA.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Informações Fiscais */}
                            <div className="space-y-4">
                                <SectionHeader title="Informações Fiscais" icon="🧠" section="fiscal" />
                                {expandedSections.fiscal && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">UF de Cadastro</label><select value={form.ufCadastro} onChange={(e) => handleChange('ufCadastro', e.target.value)} className="ios-input"><option value="">Selecione...</option>{ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tipo Contribuinte</label><select value={form.tipoContribuinte} onChange={(e) => handleChange('tipoContribuinte', e.target.value)} className="ios-input"><option value="">Selecione...</option>{TIPOS_CONTRIBUINTE.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Indicador IE</label><select value={form.indicadorIE} onChange={(e) => handleChange('indicadorIE', e.target.value)} className="ios-input"><option value="">Selecione...</option>{INDICADORES_IE.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer"><div className={`ios-toggle ${form.consumidorFinal ? 'active' : ''}`} onClick={() => handleChange('consumidorFinal', !form.consumidorFinal)} /><span className="text-sm">Consumidor Final</span></label>
                                            </div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">SUFRAMA</label><input type="text" value={form.suframa} onChange={(e) => handleChange('suframa', e.target.value)} className="ios-input" placeholder="N° SUFRAMA" /></div>
                                        </div>
                                        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Observações Fiscais</label><textarea value={form.obsFiscais} onChange={(e) => handleChange('obsFiscais', e.target.value)} className="ios-input min-h-[80px]" placeholder="Observações fiscais..." /></div>
                                    </div>
                                )}
                            </div>

                            {/* Endereço Sede */}
                            <div className="space-y-4">
                                <SectionHeader title="Endereço Principal (Sede)" icon="🏢" section="enderecoSede" />
                                {expandedSections.enderecoSede && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CEP</label><input type="text" value={form.cep} onChange={(e) => handleChange('cep', e.target.value)} onBlur={(e) => buscarCep(e.target.value, '')} className="ios-input" placeholder="00000-000" /></div>
                                            <div className="md:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Logradouro</label><input type="text" value={form.logradouro} onChange={(e) => handleChange('logradouro', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Número</label><input type="text" value={form.numero} onChange={(e) => handleChange('numero', e.target.value)} className="ios-input" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Complemento</label><input type="text" value={form.complemento} onChange={(e) => handleChange('complemento', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bairro</label><input type="text" value={form.bairro} onChange={(e) => handleChange('bairro', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cidade</label><input type="text" value={form.cidade} onChange={(e) => handleChange('cidade', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Estado</label><select value={form.estado} onChange={(e) => handleChange('estado', e.target.value)} className="ios-input"><option value="">UF</option>{ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Endereço Entrega */}
                            <div className="space-y-4">
                                <SectionHeader title="Endereço de Entrega" icon="🚚" section="enderecoEntrega" />
                                {expandedSections.enderecoEntrega && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <label className="flex items-center gap-2 cursor-pointer"><div className={`ios-toggle ${form.entregaMesmoEndereco ? 'active' : ''}`} onClick={() => handleChange('entregaMesmoEndereco', !form.entregaMesmoEndereco)} /><span className="text-sm">Mesmo endereço da sede</span></label>
                                        {!form.entregaMesmoEndereco && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CEP</label><input type="text" value={form.entregaCep} onChange={(e) => handleChange('entregaCep', e.target.value)} onBlur={(e) => buscarCep(e.target.value, 'entrega')} className="ios-input" /></div>
                                                    <div className="md:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Logradouro</label><input type="text" value={form.entregaLogradouro} onChange={(e) => handleChange('entregaLogradouro', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Número</label><input type="text" value={form.entregaNumero} onChange={(e) => handleChange('entregaNumero', e.target.value)} className="ios-input" /></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Complemento</label><input type="text" value={form.entregaComplemento} onChange={(e) => handleChange('entregaComplemento', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bairro</label><input type="text" value={form.entregaBairro} onChange={(e) => handleChange('entregaBairro', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cidade</label><input type="text" value={form.entregaCidade} onChange={(e) => handleChange('entregaCidade', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Estado</label><select value={form.entregaEstado} onChange={(e) => handleChange('entregaEstado', e.target.value)} className="ios-input"><option value="">UF</option>{ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Endereço Cobrança */}
                            <div className="space-y-4">
                                <SectionHeader title="Endereço de Cobrança" icon="💳" section="enderecoCobranca" />
                                {expandedSections.enderecoCobranca && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <label className="flex items-center gap-2 cursor-pointer"><div className={`ios-toggle ${form.cobrancaMesmoEndereco ? 'active' : ''}`} onClick={() => handleChange('cobrancaMesmoEndereco', !form.cobrancaMesmoEndereco)} /><span className="text-sm">Mesmo endereço da sede</span></label>
                                        {!form.cobrancaMesmoEndereco && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CEP</label><input type="text" value={form.cobrancaCep} onChange={(e) => handleChange('cobrancaCep', e.target.value)} onBlur={(e) => buscarCep(e.target.value, 'cobranca')} className="ios-input" /></div>
                                                    <div className="md:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Logradouro</label><input type="text" value={form.cobrancaLogradouro} onChange={(e) => handleChange('cobrancaLogradouro', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Número</label><input type="text" value={form.cobrancaNumero} onChange={(e) => handleChange('cobrancaNumero', e.target.value)} className="ios-input" /></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Complemento</label><input type="text" value={form.cobrancaComplemento} onChange={(e) => handleChange('cobrancaComplemento', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bairro</label><input type="text" value={form.cobrancaBairro} onChange={(e) => handleChange('cobrancaBairro', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cidade</label><input type="text" value={form.cobrancaCidade} onChange={(e) => handleChange('cobrancaCidade', e.target.value)} className="ios-input" /></div>
                                                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Estado</label><select value={form.cobrancaEstado} onChange={(e) => handleChange('cobrancaEstado', e.target.value)} className="ios-input"><option value="">UF</option>{ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Contato Comercial */}
                            <div className="space-y-4">
                                <SectionHeader title="Contato Comercial" icon="👨‍💼" section="contatoComercial" />
                                {expandedSections.contatoComercial && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nome do Responsável</label><input type="text" value={form.contatoNome} onChange={(e) => handleChange('contatoNome', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cargo</label><input type="text" value={form.contatoCargo} onChange={(e) => handleChange('contatoCargo', e.target.value)} className="ios-input" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Telefone</label><input type="tel" value={form.contatoTelefone} onChange={(e) => handleChange('contatoTelefone', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">WhatsApp</label><input type="tel" value={form.contatoWhatsapp} onChange={(e) => handleChange('contatoWhatsapp', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">E-mail</label><input type="email" value={form.contatoEmail} onChange={(e) => handleChange('contatoEmail', e.target.value)} className="ios-input" /></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contato Financeiro */}
                            <div className="space-y-4">
                                <SectionHeader title="Contato Financeiro" icon="💰" section="contatoFinanceiro" />
                                {expandedSections.contatoFinanceiro && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nome do Responsável</label><input type="text" value={form.financeiroNome} onChange={(e) => handleChange('financeiroNome', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">E-mail</label><input type="email" value={form.financeiroEmail} onChange={(e) => handleChange('financeiroEmail', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Telefone</label><input type="tel" value={form.financeiroTelefone} onChange={(e) => handleChange('financeiroTelefone', e.target.value)} className="ios-input" /></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Condições Comerciais */}
                            <div className="space-y-4">
                                <SectionHeader title="Condições Comerciais" icon="🧾" section="condicoesComerciais" />
                                {expandedSections.condicoesComerciais && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Forma de Pagamento</label><select value={form.formaPagamento} onChange={(e) => handleChange('formaPagamento', e.target.value)} className="ios-input"><option value="">Selecione...</option>{FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Prazo Pagamento</label><input type="text" value={form.prazoPagamento} onChange={(e) => handleChange('prazoPagamento', e.target.value)} className="ios-input" placeholder="Ex: 30/60/90" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Limite de Crédito (R$)</label><input type="number" step="0.01" value={form.limiteCredito} onChange={(e) => handleChange('limiteCredito', e.target.value)} className="ios-input" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Política de Desconto</label><input type="text" value={form.politicaDesconto} onChange={(e) => handleChange('politicaDesconto', e.target.value)} className="ios-input" placeholder="Ex: 5% à vista" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tabela de Preço</label><input type="text" value={form.tabelaPreco} onChange={(e) => handleChange('tabelaPreco', e.target.value)} className="ios-input" placeholder="Tabela padrão" /></div>
                                            <div className="flex items-center pt-6"><label className="flex items-center gap-2 cursor-pointer"><div className={`ios-toggle ${form.permiteVendaPrazo ? 'active' : ''}`} onClick={() => handleChange('permiteVendaPrazo', !form.permiteVendaPrazo)} /><span className="text-sm">Permite venda a prazo</span></label></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acesso B2B */}
                            <div className="space-y-4">
                                <SectionHeader title="Acesso ao Sistema (B2B)" icon="🔐" section="acessoB2B" />
                                {expandedSections.acessoB2B && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Usuário</label><input type="text" value={form.usuario} onChange={(e) => handleChange('usuario', e.target.value)} className="ios-input" /></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Senha</label><input type="password" value={form.senha} onChange={(e) => handleChange('senha', e.target.value)} className="ios-input" /></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Campos Internos */}
                            <div className="space-y-4">
                                <SectionHeader title="Campos Internos" icon="📝" section="internos" />
                                {expandedSections.internos && (
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Categoria / Segmento</label><select value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)} className="ios-input"><option value="">Selecione...</option>{CATEGORIAS_CLIENTE.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Região / Rota Comercial</label><input type="text" value={form.regiaoRota} onChange={(e) => handleChange('regiaoRota', e.target.value)} className="ios-input" placeholder="Ex: Zona Sul" /></div>
                                        </div>
                                        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Observações Gerais</label><textarea value={form.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} className="ios-input min-h-[100px]" placeholder="Observações..." /></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
                            <button onClick={() => setShowModal(false)} className="ios-btn ios-btn-secondary">Cancelar</button>
                            <button onClick={handleSave} className="ios-btn ios-btn-primary"><CheckIcon className="w-5 h-5" /> {editingId ? 'Salvar' : 'Cadastrar'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Importação */}
            {showImportModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
                        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]"><ArrowUpTrayIcon className="w-6 h-6 inline-block mr-2" />Importar Clientes</h2>
                            <button onClick={() => setShowImportModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)]"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {importStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 text-center">
                                        <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
                                        <h4 className="font-semibold mb-2">1. Baixe a planilha modelo</h4>
                                        <button onClick={downloadTemplate} className="ios-btn ios-btn-secondary"><ArrowDownTrayIcon className="w-5 h-5" /> Baixar Template</button>
                                    </div>
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 text-center">
                                        <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
                                        <h4 className="font-semibold mb-2">2. Envie a planilha preenchida</h4>
                                        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                                        <button onClick={() => fileInputRef.current?.click()} className="ios-btn ios-btn-primary"><ArrowUpTrayIcon className="w-5 h-5" /> Selecionar Arquivo</button>
                                    </div>
                                </div>
                            )}
                            {importStep === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-center">Preview - {importData.filter(c => c._valid).length} de {importData.length} válidos</h3>
                                    {importData.some(c => c._duplicado) && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                            <p className="font-semibold text-red-400">⚠️ CNPJs duplicados encontrados!</p>
                                        </div>
                                    )}
                                    <div className="max-h-64 overflow-y-auto border border-[var(--border)] rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[var(--bg-tertiary)] sticky top-0">
                                                <tr><th className="p-3 text-left">Status</th><th className="p-3 text-left">Nome Fantasia</th><th className="p-3 text-left">CNPJ</th><th className="p-3 text-left">Cidade</th></tr>
                                            </thead>
                                            <tbody>
                                                {importData.map((c, i) => (
                                                    <tr key={i} className={`border-t border-[var(--border)] ${c._valid ? '' : 'bg-red-500/10'}`}>
                                                        <td className="p-3">{c._valid ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                                                        <td className="p-3">{c.nomeFantasia}</td>
                                                        <td className="p-3">{c.cnpj || '-'}</td>
                                                        <td className="p-3">{c.cidade || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button onClick={() => { setImportStep(1); setImportData([]); }} className="text-sm text-[var(--text-tertiary)]">← Voltar</button>
                                </div>
                            )}
                        </div>
                        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
                            <button onClick={() => setShowImportModal(false)} className="ios-btn ios-btn-secondary">Cancelar</button>
                            {importStep === 2 && <button onClick={confirmImport} disabled={!importData.filter(c => c._valid).length} className="ios-btn ios-btn-primary disabled:opacity-50"><CheckIcon className="w-5 h-5" /> Importar {importData.filter(c => c._valid).length}</button>}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default Clientes;
