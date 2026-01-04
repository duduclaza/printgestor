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
    CubeIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    DocumentArrowDownIcon,
    Bars3BottomLeftIcon,
    QrCodeIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const TIPOS_PRODUTO = ['Toner', 'Equipamento', 'Peças', 'Mão de Obra', 'Geral'];
const UNIDADES_MEDIDA = ['UN', 'KG', 'CX', 'MT', 'LT', 'HR'];
const CORES_TONER = ['Yellow', 'Cyan', 'Magenta', 'Black'];
const CATEGORIAS_EQUIPAMENTO = ['PB', 'Color', 'Multifuncional', 'Térmica', 'Totem', 'Smartphone', 'Notebook', 'Estufa', 'Servidor', 'Leitor', 'Fragmentadora', 'Tablet', 'Impressora Comum'];
const CONTROLES_ESTOQUE = ['Série', 'Lote', 'MAC', 'IMEI', 'Sem Controle'];

const MARCAS_EQUIPAMENTO = [
    'HP', 'Epson', 'Canon', 'Brother', 'Samsung', 'Lexmark', 'Xerox', 'Ricoh', 'Kyocera', 'Sharp',
    'Toshiba Tec', 'Konica Minolta', 'Dell', 'Lenovo', 'OKI', 'Panasonic', 'Fujitsu', 'NEC', 'Olivetti',
    'Sindoh', 'Gestetner', 'Nashuatec', 'Lanier', 'Develop', 'Triumph-Adler', 'UTAX', 'Savin', 'Infotec',
    'Riso', 'Duplo', 'Sindoricoh', 'Zebra', 'Bematech', 'Elgin', 'Daruma', 'Epson TM-Series', 'Honeywell',
    'Datamax-O\'Neil', 'Bixolon', 'TSC', 'Sato', 'Argox', 'Citizen Systems', 'Star Micronics', 'Pantum',
    'Creality', 'Anycubic', 'Prusa', 'Ultimaker', 'MakerBot', 'Raise3D', 'FlashForge', 'Bambu Lab',
    'Formlabs', 'Artillery', 'Elegoo', 'Monoprice', 'Mimaki', 'Roland DG', 'Mutoh', 'HP DesignJet',
    'Canon imagePROGRAF', 'Epson SureColor', 'Compaq', 'IBM', 'Seikosha', 'Genicom', 'Tandy', 'Outra'
];

const ICMS_ORIGENS = [
    { value: '0', label: '0 – Nacional' },
    { value: '1', label: '1 – Estrangeiro importado' },
    { value: '2', label: '2 – Estrangeiro adquirido no mercado interno' },
];

const CST_CSOSN_OPTIONS = {
    simples: [
        { value: '101', label: '101 – Tributado com crédito' },
        { value: '102', label: '102 – Tributado sem crédito' },
        { value: '400', label: '400 – Não tributado' },
    ],
    lucro: [
        { value: '00', label: '00 – Tributação integral' },
        { value: '20', label: '20 – Com redução' },
        { value: '40', label: '40 – Isento' },
        { value: '60', label: '60 – ICMS-ST' },
    ],
};

const STATUS_CADASTRO = ['Disponível', 'Em Quarentena', 'A Revisar']; // Status permitidos no cadastro
const STATUS_SERIE = ['Disponível', 'Em Quarentena', 'A Revisar', 'Revisado Pendente', 'Descartado']; // Todos os status (para OS)
const CONDICAO_SERIE = ['Novo', 'Semi Novo'];

const INITIAL_FORM_STATE = {
    tipo: 'Geral', codigoProduto: '', codigoAutomatico: true, codigoSku: '', descricao: '',
    controlarEstoque: false, tiposControle: [], itensControle: [], enderecamento: '',
    ncm: '', cest: '', icmsOrigem: '0', regimeTributario: 'simples', cstCsosn: '',
    aliquotaIcms: '', aliquotaPis: '', aliquotaCofins: '', aliquotaIpi: '', gtin: '', cfop: '',
    unidadeMedida: 'UN', pesoCheio: '', pesoVazio: '', vidaUtil: '', cor: '', valorUnitario: '',
    marca: '', categoriasEquipamento: [], composicao: [],
};

// Templates de colunas para cada tipo de produto
const TEMPLATE_COLUMNS = {
    Toner: ['Código Produto', 'Código SKU', 'Descrição', 'Unidade Medida', 'Cor', 'Peso Cheio (g)', 'Peso Vazio (g)', 'Vida Útil (páginas)', 'Valor Unitário (R$)', 'NCM', 'CEST', 'GTIN'],
    Equipamento: ['Código Produto', 'Código SKU', 'Descrição', 'Unidade Medida', 'Marca', 'Categoria', 'Valor Unitário (R$)', 'NCM', 'CEST', 'GTIN'],
    Peças: ['Código Produto', 'Código SKU', 'Descrição', 'Unidade Medida', 'Vida Útil (páginas)', 'Valor Unitário (R$)', 'NCM', 'CEST', 'GTIN'],
    'Mão de Obra': ['Código Produto', 'Código SKU', 'Descrição', 'Valor Hora (R$)', 'NCM', 'CEST', 'GTIN'],
    Geral: ['Código Produto', 'Código SKU', 'Descrição', 'Unidade Medida', 'Valor Unitário (R$)', 'NCM', 'CEST', 'GTIN'],
};

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showControleModal, setShowControleModal] = useState(false);
    const [controleProduto, setControleProduto] = useState(null);
    const [novoItem, setNovoItem] = useState({
        numero: '', status: 'Disponível', condicao: 'Novo',
        dataVencimento: '', fornecedor: '', // Lote
        imei1: '', imei2: '', imei3: '' // IMEI
    });
    const [activeTab, setActiveTab] = useState(''); // New state for tabs
    const [itemSearch, setItemSearch] = useState('');
    const [itemFilterStatus, setItemFilterStatus] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [composicaoSearch, setComposicaoSearch] = useState('');
    const [importTipo, setImportTipo] = useState('');
    const [importData, setImportData] = useState([]);
    const [importStep, setImportStep] = useState(1);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setProdutos(storage.get(STORAGE_KEYS.PRODUTOS) || []);
    }, []);

    // Regra de Negócio: Se Condição == 'Semi Novo', Status não pode ser 'Disponível'
    useEffect(() => {
        if (novoItem.condicao === 'Semi Novo' && novoItem.status === 'Disponível') {
            setNovoItem(prev => ({ ...prev, status: 'A Revisar' }));
        }
    }, [novoItem.condicao]);

    const saveProdutos = (newProdutos) => {
        storage.set(STORAGE_KEYS.PRODUTOS, newProdutos);
        setProdutos(newProdutos);
    };

    const getNextCodigo = (existingProducts = produtos) => {
        const codigos = existingProducts.map((p) => parseInt(p.codigoProduto, 10)).filter((n) => !isNaN(n));
        return String((codigos.length > 0 ? Math.max(...codigos) : 0) + 1).padStart(4, '0');
    };

    const produtosParaComposicao = useMemo(() => produtos.filter((p) => {
        const tipo = p.tipo?.toLowerCase() || '';
        return tipo === 'toner' || tipo === 'peças' || tipo === 'pecas';
    }), [produtos]);

    const composicaoFiltrada = useMemo(() => {
        if (!composicaoSearch) return [];
        return produtosParaComposicao
            .filter((p) => p.descricao?.toLowerCase().includes(composicaoSearch.toLowerCase()) || p.codigoProduto?.includes(composicaoSearch))
            .filter((p) => !form.composicao?.some((c) => c.id === p.id))
            .slice(0, 5);
    }, [composicaoSearch, produtosParaComposicao, form.composicao]);

    const calculos = useMemo(() => {
        if (form.tipo !== 'Toner') return { gramatura: 0, gramaturaFolha: 0, precoFolha: 0 };
        const pesoCheio = parseFloat(form.pesoCheio) || 0, pesoVazio = parseFloat(form.pesoVazio) || 0;
        const vidaUtil = parseFloat(form.vidaUtil) || 0, valorUnitario = parseFloat(form.valorUnitario) || 0;
        const gramatura = pesoCheio - pesoVazio;
        return { gramatura, gramaturaFolha: vidaUtil > 0 ? gramatura / vidaUtil : 0, precoFolha: vidaUtil > 0 ? valorUnitario / vidaUtil : 0 };
    }, [form.tipo, form.pesoCheio, form.pesoVazio, form.vidaUtil, form.valorUnitario]);

    const produtosFiltrados = useMemo(() => {
        return produtos.filter((p) => {
            const matchSearch = p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigoProduto?.includes(searchTerm) || p.codigoSku?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchSearch && (!filterTipo || p.tipo === filterTipo);
        });
    }, [produtos, searchTerm, filterTipo]);

    const handleNew = () => { setForm({ ...INITIAL_FORM_STATE, codigoProduto: getNextCodigo() }); setEditingId(null); setComposicaoSearch(''); setShowModal(true); };
    const handleEdit = (produto) => { setForm({ ...INITIAL_FORM_STATE, ...produto, composicao: produto.composicao || [] }); setEditingId(produto.id); setComposicaoSearch(''); setShowModal(true); };
    const handleDelete = (id) => { if (confirm('Deseja realmente excluir este produto?')) saveProdutos(produtos.filter((p) => p.id !== id)); };

    const handleChange = (field, value) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'codigoAutomatico' && value) updated.codigoProduto = getNextCodigo();
            if (field === 'controlarEstoque' && !value) Object.assign(updated, { tipoControle: 'Sem Controle', numerosLote: '', numerosSerie: '', enderecamento: '', ncm: '', cest: '', icmsOrigem: '0', regimeTributario: 'simples', cstCsosn: '', aliquotaIcms: '', aliquotaPis: '', aliquotaCofins: '', aliquotaIpi: '', gtin: '', cfop: '' });
            if (field === 'tipo' && value !== 'Toner') Object.assign(updated, { pesoCheio: '', pesoVazio: '', cor: '' });
            if (field === 'tipo' && value !== 'Equipamento') Object.assign(updated, { marca: '', categoriasEquipamento: [], composicao: [] });
            if (field === 'tipo' && value === 'Mão de Obra') updated.unidadeMedida = 'HR';
            return updated;
        });
    };

    const addComposicao = (produto) => { setForm((prev) => ({ ...prev, composicao: [...(prev.composicao || []), { id: produto.id, tipo: produto.tipo, descricao: produto.descricao, codigoProduto: produto.codigoProduto, quantidade: 1 }] })); setComposicaoSearch(''); };
    const updateComposicaoQtd = (id, quantidade) => { setForm((prev) => ({ ...prev, composicao: prev.composicao.map((c) => c.id === id ? { ...c, quantidade: Math.max(1, parseInt(quantidade) || 1) } : c) })); };
    const removeComposicao = (id) => { setForm((prev) => ({ ...prev, composicao: prev.composicao.filter((c) => c.id !== id) })); };
    const toggleCategoria = (cat) => {
        setForm((prev) => ({
            ...prev,
            categoriasEquipamento: prev.categoriasEquipamento?.includes(cat)
                ? prev.categoriasEquipamento.filter(c => c !== cat)
                : [...(prev.categoriasEquipamento || []), cat]
        }));
    };
    const toggleRowExpand = (id) => { setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] })); };

    const handleSave = () => {
        if (!form.descricao.trim()) return alert('Descrição é obrigatória!');
        if (!form.codigoAutomatico && !form.codigoProduto.trim()) return alert('Código do produto é obrigatório!');
        if (form.tipo === 'Toner' && (!form.pesoCheio || !form.pesoVazio || !form.vidaUtil || !form.cor || !form.valorUnitario)) return alert('Para Toner, preencha todos os campos obrigatórios!');
        if (form.tipo === 'Equipamento' && !form.marca) return alert('Para Equipamento, selecione uma Marca!');

        // Validações de SKU
        if (form.codigoSku) {
            if (form.codigoSku === form.codigoProduto) return alert('O SKU não pode ser igual ao Código do Produto!');
            const skuExiste = produtos.some(p => p.codigoSku === form.codigoSku && p.id !== editingId);
            if (skuExiste) return alert('Este SKU já está em uso por outro produto!');
        }
        const produtoData = { ...form, id: editingId || Date.now(), gramatura: calculos.gramatura, gramaturaFolha: calculos.gramaturaFolha, precoFolha: calculos.precoFolha, updatedAt: new Date().toISOString() };
        saveProdutos(editingId ? produtos.map((p) => (p.id === editingId ? produtoData : p)) : [...produtos, produtoData]);
        setShowModal(false);
    };

    // Funções para gerenciar itens de controle (Série, Lote, MAC, IMEI)
    // Funções para gerenciar itens de controle (Série, Lote, MAC, IMEI)
    const openControleModal = (produto, initialTab = null) => {
        setControleProduto(produto);
        const tipos = produto.tiposControle || (produto.tipoControle && produto.tipoControle !== 'Sem Controle' ? [produto.tipoControle] : []);
        if (tipos.length > 0) setActiveTab(initialTab || tipos[0]);
        setNovoItem({ numero: '', status: 'Disponível', condicao: 'Novo', dataVencimento: '', fornecedor: '', imei1: '', imei2: '', imei3: '' });
        setShowControleModal(true);
    };

    const getItemLabel = (tipo) => {
        const labels = { 'Série': 'Número de Série', 'Lote': 'Número do Lote', 'MAC': 'Endereço MAC', 'IMEI': 'IMEI' };
        return labels[tipo] || 'Item';
    };

    const addItem = () => {
        const tipoControle = activeTab;

        if (tipoControle === 'IMEI') {
            if (!novoItem.imei1.trim()) return alert('IMEI 1 é obrigatório!');
        } else {
            if (!novoItem.numero.trim()) return alert(`${getItemLabel(tipoControle)} é obrigatório!`);
        }

        const itemExiste = controleProduto.itensControle?.some(s => {
            const mesmoTipo = s.tipo === tipoControle || !s.tipo; // Compatibilidade com legado
            if (!mesmoTipo) return false;
            return tipoControle === 'IMEI' ? s.imei1 === novoItem.imei1.trim() : s.numero === novoItem.numero.trim();
        });
        if (itemExiste) return alert('Este item já existe!');

        const novoItemData = {
            id: Date.now(),
            tipo: tipoControle,
            numero: novoItem.numero.trim(),
            status: novoItem.status,
            condicao: novoItem.condicao,
            createdAt: new Date().toISOString(),
            ...(tipoControle === 'Lote' && { dataVencimento: novoItem.dataVencimento, fornecedor: novoItem.fornecedor }),
            ...(tipoControle === 'IMEI' && { imei1: novoItem.imei1.trim(), imei2: novoItem.imei2.trim(), imei3: novoItem.imei3.trim() })
        };

        const produtoAtualizado = {
            ...controleProduto,
            itensControle: [...(controleProduto.itensControle || []), novoItemData]
        };

        saveProdutos(produtos.map(p => p.id === controleProduto.id ? produtoAtualizado : p));
        setControleProduto(produtoAtualizado);
        setNovoItem({ numero: '', status: 'Disponível', condicao: 'Novo', dataVencimento: '', fornecedor: '', imei1: '', imei2: '', imei3: '' });
    };

    const updateItem = (itemId, field, value) => {
        const produtoAtualizado = {
            ...controleProduto,
            itensControle: controleProduto.itensControle.map(s => s.id === itemId ? { ...s, [field]: value } : s)
        };
        saveProdutos(produtos.map(p => p.id === controleProduto.id ? produtoAtualizado : p));
        setControleProduto(produtoAtualizado);
    };

    const removeItem = (itemId) => {
        if (!confirm('Deseja remover este item?')) return;
        const produtoAtualizado = {
            ...controleProduto,
            itensControle: controleProduto.itensControle.filter(s => s.id !== itemId)
        };
        saveProdutos(produtos.map(p => p.id === controleProduto.id ? produtoAtualizado : p));
        setControleProduto(produtoAtualizado);
    };

    // === FUNÇÕES DE IMPORTAÇÃO ===
    const openImportModal = () => {
        setImportTipo('');
        setImportData([]);
        setImportStep(1);
        setShowImportModal(true);
    };

    const downloadTemplate = (tipo) => {
        try {
            const columns = TEMPLATE_COLUMNS[tipo];

            // Criar linha de exemplo
            const exampleRow = columns.map(col => {
                if (col === 'Código Produto') return '0001';
                if (col === 'Código SKU') return 'SKU-001';
                if (col === 'Descrição') return `Exemplo ${tipo}`;
                if (col === 'Unidade Medida') return 'UN';
                if (col === 'Cor') return 'Black';
                if (col === 'Peso Cheio (g)') return 500;
                if (col === 'Peso Vazio (g)') return 100;
                if (col === 'Vida Útil (páginas)') return 8000;
                if (col === 'Valor Unitário (R$)') return 150.00;
                if (col === 'Marca') return 'HP';
                if (col === 'NCM') return '84439999';
                if (col === 'CEST') return '';
                if (col === 'GTIN') return '';
                return '';
            });

            // Criar worksheet com header e exemplo
            const wsData = [columns, exampleRow];
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Ajustar largura das colunas
            ws['!cols'] = columns.map(() => ({ wch: 22 }));

            // Criar workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, tipo);

            // Gerar arquivo e fazer download
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `template_${tipo.toLowerCase().replace('ç', 'c')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar template:', error);
            alert('Erro ao gerar o template. Tente novamente.');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Códigos já cadastrados
            const codigosExistentes = produtos.map(p => p.codigoProduto);

            // Converter para formato interno
            const codigosNaImportacao = [];
            const converted = jsonData.map((row, index) => {
                const codigoProduto = row['Código Produto']?.toString().padStart(4, '0') || '';

                // Verificar duplicatas
                const codigoDuplicadoExistente = codigoProduto && codigosExistentes.includes(codigoProduto);
                const codigoDuplicadoNaImportacao = codigoProduto && codigosNaImportacao.includes(codigoProduto);

                if (codigoProduto) codigosNaImportacao.push(codigoProduto);

                const produto = {
                    tipo: importTipo,
                    codigoProduto: codigoProduto,
                    codigoSku: row['Código SKU']?.toString() || '',
                    descricao: row['Descrição'] || '',
                    unidadeMedida: row['Unidade Medida'] || 'UN',
                    valorUnitario: row['Valor Unitário (R$)']?.toString() || '',
                    ncm: row['NCM']?.toString() || '',
                    cest: row['CEST']?.toString() || '',
                    gtin: row['GTIN']?.toString() || '',
                    controlarEstoque: !!(row['NCM'] || row['CEST'] || row['GTIN']),
                    _valid: !!row['Descrição'],
                    _row: index + 2,
                    _codigoDuplicado: codigoDuplicadoExistente || codigoDuplicadoNaImportacao,
                    _erroDuplicado: codigoDuplicadoExistente ? 'Código já existe no sistema' : (codigoDuplicadoNaImportacao ? 'Código duplicado na planilha' : ''),
                };

                // Se tem código duplicado, marcar como inválido
                if (produto._codigoDuplicado) {
                    produto._valid = false;
                }

                if (importTipo === 'Toner') {
                    produto.cor = row['Cor'] || '';
                    produto.pesoCheio = row['Peso Cheio (g)']?.toString() || '';
                    produto.pesoVazio = row['Peso Vazio (g)']?.toString() || '';
                    produto.vidaUtil = row['Vida Útil (páginas)']?.toString() || '';
                    const camposOk = !!(row['Descrição'] && row['Cor'] && row['Peso Cheio (g)'] && row['Peso Vazio (g)'] && row['Vida Útil (páginas)'] && row['Valor Unitário (R$)']);
                    produto._valid = camposOk && !produto._codigoDuplicado;
                }

                if (importTipo === 'Equipamento') {
                    produto.marca = row['Marca'] || '';
                    const camposOk = !!(row['Descrição'] && row['Marca']);
                    produto._valid = camposOk && !produto._codigoDuplicado;
                }

                if (importTipo === 'Peças') {
                    produto.vidaUtil = row['Vida Útil (páginas)']?.toString() || '';
                }

                return produto;
            }).filter(p => p.descricao); // Remover linhas vazias

            setImportData(converted);
            setImportStep(3);
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const confirmImport = () => {
        const validProducts = importData.filter(p => p._valid);
        if (validProducts.length === 0) {
            alert('Nenhum produto válido para importar!');
            return;
        }

        let currentProducts = [...produtos];
        const newProducts = validProducts.map((p, i) => {
            const { _valid, _row, ...productData } = p;
            const codigo = p.codigoProduto || getNextCodigo([...currentProducts, ...validProducts.slice(0, i)]);
            const newProduct = {
                ...INITIAL_FORM_STATE,
                ...productData,
                codigoProduto: codigo,
                codigoAutomatico: !p.codigoProduto,
                id: Date.now() + i,
                updatedAt: new Date().toISOString(),
            };

            // Calcular gramatura para toners
            if (newProduct.tipo === 'Toner') {
                const pesoCheio = parseFloat(newProduct.pesoCheio) || 0;
                const pesoVazio = parseFloat(newProduct.pesoVazio) || 0;
                const vidaUtil = parseFloat(newProduct.vidaUtil) || 0;
                const valorUnitario = parseFloat(newProduct.valorUnitario) || 0;
                newProduct.gramatura = pesoCheio - pesoVazio;
                newProduct.gramaturaFolha = vidaUtil > 0 ? newProduct.gramatura / vidaUtil : 0;
                newProduct.precoFolha = vidaUtil > 0 ? valorUnitario / vidaUtil : 0;
            }

            return newProduct;
        });

        saveProdutos([...produtos, ...newProducts]);
        setShowImportModal(false);
        alert(`${newProducts.length} produto(s) importado(s) com sucesso!`);
    };

    // Modal de Importação
    const ImportModal = () => {
        if (!showImportModal) return null;

        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
                    {/* Header */}
                    <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[var(--border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                            <ArrowUpTrayIcon className="w-6 h-6 inline-block mr-2 -mt-1" />
                            Importar Produtos via Excel
                        </h2>
                        <button onClick={() => setShowImportModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${importStep >= step ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
                                        {step}
                                    </div>
                                    {step < 3 && <div className={`w-12 h-0.5 ${importStep > step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Selecionar Tipo */}
                        {importStep === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-center mb-6">Selecione o tipo de produto a importar</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {TIPOS_PRODUTO.map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => { setImportTipo(tipo); setImportStep(2); }}
                                            className={`p-6 rounded-xl border-2 transition-all hover:border-[var(--accent)] ${importTipo === tipo ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)]'}`}
                                        >
                                            <CubeIcon className="w-8 h-8 mx-auto mb-2 text-[var(--accent)]" />
                                            <p className="font-semibold">{tipo}</p>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1">{TEMPLATE_COLUMNS[tipo].length} campos</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Download Template e Upload */}
                        {importStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-center">Importando: <span className="text-[var(--accent)]">{importTipo}</span></h3>

                                {/* Download Template */}
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 text-center">
                                    <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
                                    <h4 className="font-semibold mb-2">1. Baixe a planilha modelo</h4>
                                    <p className="text-sm text-[var(--text-tertiary)] mb-4">Preencha a planilha com os dados dos seus produtos</p>
                                    <button
                                        onClick={() => downloadTemplate(importTipo)}
                                        className="ios-btn ios-btn-secondary"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" /> Baixar Template {importTipo}
                                    </button>
                                </div>

                                {/* Upload */}
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 text-center">
                                    <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
                                    <h4 className="font-semibold mb-2">2. Envie a planilha preenchida</h4>
                                    <p className="text-sm text-[var(--text-tertiary)] mb-4">Aceita arquivos .xlsx ou .xls</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".xlsx,.xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="ios-btn ios-btn-primary"
                                    >
                                        <ArrowUpTrayIcon className="w-5 h-5" /> Selecionar Arquivo
                                    </button>
                                </div>

                                <button onClick={() => setImportStep(1)} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                    ← Voltar e escolher outro tipo
                                </button>
                            </div>
                        )}

                        {/* Step 3: Preview */}
                        {importStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-center">
                                    Preview da Importação - <span className="text-[var(--accent)]">{importTipo}</span>
                                </h3>
                                <p className="text-sm text-center text-[var(--text-tertiary)]">
                                    {importData.filter(p => p._valid).length} de {importData.length} produtos válidos
                                </p>

                                {/* Alerta de códigos duplicados */}
                                {importData.some(p => p._codigoDuplicado) && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                                        <span className="text-red-500 text-xl">⚠️</span>
                                        <div>
                                            <p className="font-semibold text-red-400">Códigos duplicados encontrados!</p>
                                            <p className="text-sm text-[var(--text-tertiary)]">
                                                Produtos com códigos já existentes no sistema ou duplicados na planilha serão ignorados na importação.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="max-h-64 overflow-y-auto border border-[var(--border)] rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[var(--bg-tertiary)] sticky top-0">
                                            <tr>
                                                <th className="p-3 text-left">Status</th>
                                                <th className="p-3 text-left">Código</th>
                                                <th className="p-3 text-left">Descrição</th>
                                                {importTipo === 'Toner' && <th className="p-3 text-left">Cor</th>}
                                                {importTipo === 'Equipamento' && <th className="p-3 text-left">Marca</th>}
                                                <th className="p-3 text-left">Erro</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {importData.map((p, i) => (
                                                <tr key={i} className={`border-t border-[var(--border)] ${p._valid ? '' : 'bg-red-500/10'}`}>
                                                    <td className="p-3">
                                                        {p._valid ? (
                                                            <span className="text-green-500">✓</span>
                                                        ) : (
                                                            <span className="text-red-500">✗</span>
                                                        )}
                                                    </td>
                                                    <td className={`p-3 font-mono ${p._codigoDuplicado ? 'text-red-400' : ''}`}>
                                                        {p.codigoProduto || '(auto)'}
                                                    </td>
                                                    <td className="p-3">{p.descricao}</td>
                                                    {importTipo === 'Toner' && <td className="p-3">{p.cor || '-'}</td>}
                                                    {importTipo === 'Equipamento' && <td className="p-3">{p.marca || '-'}</td>}
                                                    <td className="p-3 text-xs text-red-400">
                                                        {p._erroDuplicado || (!p._valid && !p._codigoDuplicado ? 'Campos obrigatórios' : '')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button onClick={() => { setImportStep(2); setImportData([]); }} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                    ← Voltar e enviar outro arquivo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
                        <button onClick={() => setShowImportModal(false)} className="ios-btn ios-btn-secondary">Cancelar</button>
                        {importStep === 3 && (
                            <button
                                onClick={confirmImport}
                                disabled={importData.filter(p => p._valid).length === 0}
                                className="ios-btn ios-btn-primary disabled:opacity-50"
                            >
                                <CheckIcon className="w-5 h-5" /> Importar {importData.filter(p => p._valid).length} Produtos
                            </button>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Produtos</h1>
                    <p className="text-[var(--text-tertiary)] mt-1">Gerencie toners, equipamentos, peças e produtos gerais</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openImportModal} className="ios-btn ios-btn-secondary">
                        <ArrowUpTrayIcon className="w-5 h-5" /> Importar Excel
                    </button>
                    <button onClick={handleNew} className="ios-btn ios-btn-primary">
                        <PlusIcon className="w-5 h-5" /> Novo Produto
                    </button>
                </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="ios-card p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Campo de Busca */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ios-input pr-10 bg-[var(--bg-secondary)]"
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                    </div>

                    {/* Filtros por Tipo */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-tertiary)] hidden sm:block mr-2">Filtrar:</span>
                        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-xl">
                            <button
                                onClick={() => setFilterTipo('')}
                                className={`w-20 py-2 rounded-lg text-sm font-medium transition-all ${!filterTipo ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                            >
                                Todos
                            </button>
                            {TIPOS_PRODUTO.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilterTipo(t)}
                                    className={`w-24 py-2 rounded-lg text-sm font-medium transition-all ${filterTipo === t ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="ios-card overflow-hidden">
                {produtosFiltrados.length === 0 ? (
                    <div className="p-16 text-center">
                        <CubeIcon className="w-16 h-16 mx-auto text-[var(--text-quaternary)] mb-4" />
                        <p className="text-[var(--text-tertiary)]">Nenhum produto cadastrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                    <th className="w-10 p-4"></th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Código</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">SKU</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Descrição</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Tipo</th>
                                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">UN</th>
                                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Valor</th>
                                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosFiltrados.map((p) => (
                                    <>
                                        <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="p-4">
                                                {p.tipo === 'Equipamento' && p.composicao?.length > 0 && (
                                                    <button onClick={() => toggleRowExpand(p.id)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
                                                        {expandedRows[p.id] ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-sm">{p.codigoProduto}</td>
                                            <td className="p-4 text-sm text-[var(--text-secondary)]">{p.codigoSku || '-'}</td>
                                            <td className="p-4">
                                                <div className="font-medium">{p.descricao}</div>
                                                {p.tipo === 'Toner' && p.cor && <span className="text-xs text-[var(--text-tertiary)]">{p.cor}</span>}
                                                {p.tipo === 'Equipamento' && p.marca && <span className="text-xs text-[var(--text-tertiary)]">{p.marca}</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.tipo === 'Toner' ? 'bg-blue-500/20 text-blue-400' : p.tipo === 'Equipamento' ? 'bg-green-500/20 text-green-400' : p.tipo === 'Peças' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{p.tipo}</span>
                                            </td>
                                            <td className="p-4 text-sm">{p.unidadeMedida}</td>
                                            <td className="p-4 text-sm text-right font-medium">{p.valorUnitario ? `R$ ${parseFloat(p.valorUnitario).toFixed(2)}` : '-'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(p.tiposControle || (p.tipoControle && p.tipoControle !== 'Sem Controle' ? [p.tipoControle] : [])).map(t => {
                                                        const Icon = t === 'Série' ? QrCodeIcon : t === 'MAC' ? WifiIcon : t === 'IMEI' ? DevicePhoneMobileIcon : CubeIcon;
                                                        return (
                                                            <button key={t} onClick={() => openControleModal(p, t)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400" title={`Gerenciar ${t}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </button>
                                                        );
                                                    })}
                                                    <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--accent)]"><PencilSquareIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-[var(--danger)]/10 text-[var(--danger)]"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {p.tipo === 'Equipamento' && expandedRows[p.id] && p.composicao?.length > 0 && (
                                            <tr key={`${p.id}-comp`} className="bg-[var(--bg-tertiary)]/50">
                                                <td colSpan={8} className="p-4 pl-14">
                                                    <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">Composição</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {p.composicao.map((c) => (
                                                            <span key={c.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-sm">
                                                                <span className={`w-2 h-2 rounded-full ${c.tipo === 'Toner' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
                                                                {c.descricao} <span className="text-[var(--text-tertiary)]">×{c.quantidade}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Novo/Editar Produto */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
                        {/* Header Fixo */}
                        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                        </div>

                        {/* Body Scrollável */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Dados Básicos */}
                            <section>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Dados Básicos</h3>
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tipo de Produto *</label>
                                            <select value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} className="ios-input">
                                                {TIPOS_PRODUTO.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Código SKU</label>
                                            <input type="text" value={form.codigoSku} onChange={(e) => handleChange('codigoSku', e.target.value)} className="ios-input" placeholder="Ex: SKU-001" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Código do Produto *</label>
                                            <div className="flex items-center gap-3">
                                                <input type="text" value={form.codigoProduto} onChange={(e) => handleChange('codigoProduto', e.target.value)} disabled={form.codigoAutomatico} className="ios-input flex-1" placeholder="0001" />
                                                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                                    <div className={`ios-toggle ${form.codigoAutomatico ? 'active' : ''}`} onClick={() => handleChange('codigoAutomatico', !form.codigoAutomatico)} />
                                                    <span className="text-sm text-[var(--text-secondary)]">Auto</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Descrição *</label>
                                            <input type="text" value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} className="ios-input" placeholder="Nome/descrição do produto" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Toggle Estoque */}
                            <section>
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <span className="font-medium text-[var(--text-primary)]">Deseja controlar estoque?</span>
                                        <p className="text-sm text-[var(--text-tertiary)]">Ativa controle de quantidade e dados fiscais</p>
                                    </div>
                                    <div className={`ios-toggle ${form.controlarEstoque ? 'active' : ''}`} onClick={() => handleChange('controlarEstoque', !form.controlarEstoque)} />
                                </div>
                            </section>

                            {/* Controles - Sempre visível para Rastreabilidade */}
                            <section>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Controlar Rastreabilidade</h3>
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        {CONTROLES_ESTOQUE.filter(c => c !== 'Sem Controle').map((c) => {
                                            const isChecked = form.tiposControle?.includes(c);
                                            return (
                                                <label key={c} className="flex items-center gap-2 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'}`}>
                                                        {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                    <span>{c}</span>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={isChecked || false}
                                                        onChange={() => {
                                                            setForm(prev => {
                                                                const current = prev.tiposControle || [];
                                                                const novo = current.includes(c)
                                                                    ? current.filter(t => t !== c)
                                                                    : [...current, c];
                                                                return { ...prev, tiposControle: novo };
                                                            });
                                                        }}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {form.tiposControle && form.tiposControle.length > 0 && (
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-start gap-3">
                                            <Bars3BottomLeftIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-blue-400 font-medium">Gerenciamento de Itens</p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    Após salvar, gerencie {form.tiposControle.join(', ')} na lista de produtos.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <input type="text" value={form.enderecamento} onChange={(e) => handleChange('enderecamento', e.target.value)} className="ios-input" placeholder="Endereçamento (ex: Prateleira A)" />
                                </div>
                            </section>

                            {/* Fiscal */}
                            {form.controlarEstoque && (
                                <section>
                                    <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Dados Fiscais</h3>
                                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input type="text" value={form.ncm} onChange={(e) => handleChange('ncm', e.target.value)} className="ios-input" placeholder="NCM" />
                                            <input type="text" value={form.cest} onChange={(e) => handleChange('cest', e.target.value)} className="ios-input" placeholder="CEST" />
                                            <select value={form.icmsOrigem} onChange={(e) => handleChange('icmsOrigem', e.target.value)} className="ios-input">
                                                {ICMS_ORIGENS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select value={form.regimeTributario} onChange={(e) => handleChange('regimeTributario', e.target.value)} className="ios-input">
                                                <option value="simples">Simples Nacional (CSOSN)</option>
                                                <option value="lucro">Lucro Presumido/Real (CST)</option>
                                            </select>
                                            <select value={form.cstCsosn} onChange={(e) => handleChange('cstCsosn', e.target.value)} className="ios-input">
                                                <option value="">Selecione {form.regimeTributario === 'simples' ? 'CSOSN' : 'CST'}...</option>
                                                {CST_CSOSN_OPTIONS[form.regimeTributario].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <input type="number" step="0.01" value={form.aliquotaIcms} onChange={(e) => handleChange('aliquotaIcms', e.target.value)} className="ios-input" placeholder="ICMS %" />
                                            <input type="number" step="0.01" value={form.aliquotaPis} onChange={(e) => handleChange('aliquotaPis', e.target.value)} className="ios-input" placeholder="PIS %" />
                                            <input type="number" step="0.01" value={form.aliquotaCofins} onChange={(e) => handleChange('aliquotaCofins', e.target.value)} className="ios-input" placeholder="COFINS %" />
                                            <input type="number" step="0.01" value={form.aliquotaIpi} onChange={(e) => handleChange('aliquotaIpi', e.target.value)} className="ios-input" placeholder="IPI %" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" value={form.gtin} onChange={(e) => handleChange('gtin', e.target.value)} className="ios-input" placeholder="GTIN / Código de Barras" />
                                            <input type="text" value={form.cfop} onChange={(e) => handleChange('cfop', e.target.value)} className="ios-input" placeholder="CFOP" />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Características */}
                            <section>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Características</h3>
                                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Unidade de Medida *</label>
                                            <select value={form.unidadeMedida} onChange={(e) => handleChange('unidadeMedida', e.target.value)} className="ios-input">
                                                {UNIDADES_MEDIDA.map((u) => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                        {(form.tipo === 'Toner' || form.tipo === 'Equipamento' || form.tipo === 'Peças' || form.tipo === 'Geral' || form.tipo === 'Mão de Obra') && (
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                    {form.tipo === 'Mão de Obra' ? 'Valor Hora (R$)' : 'Valor Unitário (R$)'} {form.tipo === 'Toner' && '*'}
                                                </label>
                                                <input type="number" step="0.01" value={form.valorUnitario} onChange={(e) => handleChange('valorUnitario', e.target.value)} className="ios-input" placeholder="0.00" />
                                            </div>
                                        )}
                                    </div>

                                    {(form.tipo === 'Toner' || form.tipo === 'Peças') && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Vida Útil (páginas) {form.tipo === 'Toner' && '*'}</label>
                                            <input type="number" value={form.vidaUtil} onChange={(e) => handleChange('vidaUtil', e.target.value)} className="ios-input" placeholder="Ex: 8000" />
                                        </div>
                                    )}

                                    {/* Toner */}
                                    {form.tipo === 'Toner' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cor *</label>
                                                    <select value={form.cor} onChange={(e) => handleChange('cor', e.target.value)} className="ios-input">
                                                        <option value="">Selecione...</option>
                                                        {CORES_TONER.map((c) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Peso Cheio (g) *</label>
                                                    <input type="number" step="0.01" value={form.pesoCheio} onChange={(e) => handleChange('pesoCheio', e.target.value)} className="ios-input" placeholder="500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Peso Vazio (g) *</label>
                                                    <input type="number" step="0.01" value={form.pesoVazio} onChange={(e) => handleChange('pesoVazio', e.target.value)} className="ios-input" placeholder="100" />
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent rounded-xl p-4 border border-[var(--accent)]/20">
                                                <h4 className="text-sm font-semibold text-[var(--accent)] mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[var(--accent)] rounded-full"></span> Calculados Automaticamente
                                                </h4>
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div><p className="text-xs text-[var(--text-tertiary)]">Gramatura</p><p className="text-lg font-bold">{calculos.gramatura.toFixed(2)}g</p></div>
                                                    <div><p className="text-xs text-[var(--text-tertiary)]">Gram./Folha</p><p className="text-lg font-bold">{calculos.gramaturaFolha.toFixed(6)}g</p></div>
                                                    <div><p className="text-xs text-[var(--text-tertiary)]">R$/Folha</p><p className="text-lg font-bold">R$ {calculos.precoFolha.toFixed(6)}</p></div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Equipamento */}
                                    {form.tipo === 'Equipamento' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Marca *</label>
                                                    <select value={form.marca} onChange={(e) => handleChange('marca', e.target.value)} className="ios-input">
                                                        <option value="">Selecione a marca...</option>
                                                        {MARCAS_EQUIPAMENTO.map((m) => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Categorias</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {CATEGORIAS_EQUIPAMENTO.map((cat) => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => toggleCategoria(cat)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${form.categoriasEquipamento?.includes(cat)
                                                                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                                                                }`}
                                                        >
                                                            {form.categoriasEquipamento?.includes(cat) && <CheckIcon className="w-4 h-4 inline-block mr-1 -mt-0.5" />}
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="border-t border-[var(--border)] pt-4 mt-4">
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Composição (Peças e Toners)</label>
                                                <div className="relative">
                                                    <input type="text" value={composicaoSearch} onChange={(e) => setComposicaoSearch(e.target.value)} className="ios-input" placeholder="Pesquisar peças ou toners para adicionar..." />
                                                    {composicaoFiltrada.length > 0 && (
                                                        <div className="absolute z-10 w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
                                                            {composicaoFiltrada.map((p) => (
                                                                <button key={p.id} onClick={() => addComposicao(p)} className="w-full px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] flex items-center justify-between transition-colors">
                                                                    <div><span className="font-medium">{p.descricao}</span><span className="text-xs text-[var(--text-tertiary)] ml-2">#{p.codigoProduto}</span></div>
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${p.tipo === 'Toner' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{p.tipo}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {form.composicao?.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {form.composicao.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-3 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border)]">
                                                                <span className={`px-2 py-0.5 rounded text-xs ${item.tipo === 'Toner' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{item.tipo}</span>
                                                                <span className="flex-1 text-sm">{item.descricao}</span>
                                                                <input type="number" min="1" value={item.quantidade} onChange={(e) => updateComposicaoQtd(item.id, e.target.value)} className="w-16 ios-input text-center py-1 px-2" />
                                                                <button onClick={() => removeComposicao(item.id)} className="p-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded"><XMarkIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Footer Fixo */}
                        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
                            <button onClick={() => setShowModal(false)} className="ios-btn ios-btn-secondary">Cancelar</button>
                            <button onClick={handleSave} className="ios-btn ios-btn-primary"><CheckIcon className="w-5 h-5" /> {editingId ? 'Salvar' : 'Cadastrar'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ImportModal />

            {/* Modal de Gerenciamento de Controle (Série, Lote, MAC, IMEI) */}
            {showControleModal && controleProduto && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="flex-shrink-0 flex flex-col border-b border-[var(--border)]">
                            <div className="flex items-center justify-between p-6 pb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                        <Bars3BottomLeftIcon className="w-6 h-6 inline-block mr-2 -mt-1" />
                                        Gerenciar Itens
                                    </h2>
                                    <p className="text-sm text-[var(--text-tertiary)] mt-1">{controleProduto.descricao} - #{controleProduto.codigoProduto}</p>
                                </div>
                                <button onClick={() => setShowControleModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tabs */}
                            {(controleProduto.tiposControle?.length > 1 || (!controleProduto.tiposControle && controleProduto.tipoControle && controleProduto.tipoControle !== 'Sem Controle')) && (
                                <div className="px-6 flex gap-6 overflow-x-auto">
                                    {(controleProduto.tiposControle || [controleProduto.tipoControle]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTab(t)}
                                            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === t ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            {t}
                                            {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Adicionar novo item */}
                            <div className="bg-[var(--bg-tertiary)] rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                                    ➕ Adicionar {getItemLabel(activeTab)}
                                </h3>

                                {/* Campos para IMEI */}
                                {activeTab === 'IMEI' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input type="text" value={novoItem.imei1} onChange={(e) => setNovoItem(prev => ({ ...prev, imei1: e.target.value }))} className="ios-input" placeholder="IMEI 1 *" />
                                            <input type="text" value={novoItem.imei2} onChange={(e) => setNovoItem(prev => ({ ...prev, imei2: e.target.value }))} className="ios-input" placeholder="IMEI 2 (opcional)" />
                                            <input type="text" value={novoItem.imei3} onChange={(e) => setNovoItem(prev => ({ ...prev, imei3: e.target.value }))} className="ios-input" placeholder="IMEI 3 (opcional)" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                                                <select value={novoItem.status} onChange={(e) => setNovoItem(prev => ({ ...prev, status: e.target.value }))} className="ios-input">
                                                    {STATUS_CADASTRO
                                                        .filter(s => novoItem.condicao === 'Semi Novo' ? s !== 'Disponível' : true)
                                                        .map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Condição</label>
                                                <select value={novoItem.condicao} onChange={(e) => setNovoItem(prev => ({ ...prev, condicao: e.target.value }))} className="ios-input">
                                                    {CONDICAO_SERIE.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-[var(--text-secondary)] mb-1">{getItemLabel(activeTab)}</label>
                                                <input
                                                    type="text"
                                                    value={novoItem.numero}
                                                    onChange={(e) => setNovoItem(prev => ({ ...prev, numero: e.target.value }))}
                                                    className="ios-input"
                                                    placeholder={getItemLabel(activeTab)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                                                <select value={novoItem.status} onChange={(e) => setNovoItem(prev => ({ ...prev, status: e.target.value }))} className="ios-input">
                                                    {STATUS_CADASTRO
                                                        .filter(s => novoItem.condicao === 'Semi Novo' ? s !== 'Disponível' : true)
                                                        .map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Condição</label>
                                                <select value={novoItem.condicao} onChange={(e) => setNovoItem(prev => ({ ...prev, condicao: e.target.value }))} className="ios-input">
                                                    {CONDICAO_SERIE.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Campos extras para Lote */}
                                        {activeTab === 'Lote' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Data de Vencimento</label>
                                                    <input
                                                        type="date"
                                                        value={novoItem.dataVencimento}
                                                        onChange={(e) => setNovoItem(prev => ({ ...prev, dataVencimento: e.target.value }))}
                                                        className="ios-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Fornecedor</label>
                                                    <input
                                                        type="text"
                                                        value={novoItem.fornecedor}
                                                        onChange={(e) => setNovoItem(prev => ({ ...prev, fornecedor: e.target.value }))}
                                                        className="ios-input"
                                                        placeholder="Nome do fornecedor"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button onClick={addItem} className="ios-btn ios-btn-primary mt-4">
                                    <PlusIcon className="w-5 h-5" /> Adicionar
                                </button>
                            </div>

                            {/* Lista de itens */}
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                                    📋 Itens Cadastrados - {activeTab}
                                </h3>

                                {/* Filtros e Busca */}
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
                                    <div className="relative w-full max-w-sm">
                                        <input
                                            type="text"
                                            value={itemSearch}
                                            onChange={(e) => setItemSearch(e.target.value)}
                                            className="ios-input pl-4 pr-10 w-full"
                                            placeholder={`Buscar ${activeTab === 'IMEI' ? 'IMEI' : 'número'}...`}
                                        />
                                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                    </div>
                                    <select
                                        value={itemFilterStatus}
                                        onChange={(e) => setItemFilterStatus(e.target.value)}
                                        className="ios-input w-full md:w-48"
                                    >
                                        <option value="">Todos Status</option>
                                        {STATUS_CADASTRO.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                {(!controleProduto.itensControle || controleProduto.itensControle.filter(i => (i.tipo === activeTab) || (!i.tipo && activeTab === controleProduto.tipoControle)).length === 0) ? (
                                    <div className="text-center py-8 text-[var(--text-tertiary)]">
                                        Nenhum item cadastrado para {activeTab}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {controleProduto.itensControle
                                            .filter(i => (i.tipo === activeTab) || (!i.tipo && activeTab === controleProduto.tipoControle))
                                            .filter(item => {
                                                if (itemFilterStatus && item.status !== itemFilterStatus) return false;
                                                if (itemSearch) {
                                                    const term = itemSearch.toLowerCase();
                                                    if (activeTab === 'IMEI') {
                                                        return item.imei1?.includes(term) || item.imei2?.includes(term) || item.imei3?.includes(term);
                                                    }
                                                    return item.numero?.toLowerCase().includes(term);
                                                }
                                                return true;
                                            })
                                            .map(item => (
                                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                                    {/* Info Principal */}
                                                    <div>
                                                        {activeTab === 'IMEI' ? (
                                                            <div className="space-y-1">
                                                                <p className="font-mono font-semibold text-[var(--text-primary)]">{item.imei1}</p>
                                                                {item.imei2 && <p className="font-mono text-xs text-[var(--text-secondary)]">IMEI 2: {item.imei2}</p>}
                                                                {item.imei3 && <p className="font-mono text-xs text-[var(--text-secondary)]">IMEI 3: {item.imei3}</p>}
                                                            </div>
                                                        ) : (
                                                            <p className="font-mono font-semibold text-[var(--text-primary)]">{item.numero}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-tertiary)]">
                                                            <span>📅 {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                                                            {activeTab === 'Lote' && (
                                                                <>
                                                                    {item.dataVencimento && <span>🕒 Vence: {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}</span>}
                                                                    {item.fornecedor && <span>🏢 {item.fornecedor}</span>}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div>
                                                        <label className="block md:hidden text-xs text-[var(--text-tertiary)] mb-1">Status</label>
                                                        <span className={`inline-block px-2 py-1.5 rounded-lg text-xs font-medium text-center w-full ${item.status === 'Disponível' ? 'bg-green-500/20 text-green-400' :
                                                            item.status === 'Descartado' ? 'bg-red-500/20 text-red-400' :
                                                                item.status === 'Em Quarentena' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    item.status === 'Revisado Pendente' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    {/* Condição */}
                                                    <div>
                                                        <label className="block md:hidden text-xs text-[var(--text-tertiary)] mb-1">Condição</label>
                                                        <span className="inline-block px-2 py-1.5 rounded-lg text-xs font-medium text-center w-full bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                                                            {item.condicao || item.situacao || 'Novo'}
                                                        </span>
                                                    </div>

                                                    {/* Ação */}
                                                    <div className="flex justify-end">
                                                        <button onClick={() => removeItem(item.id)} className="p-2 rounded-lg hover:bg-[var(--danger)]/10 text-[var(--danger)]" title="Remover">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
                            <button onClick={() => setShowControleModal(false)} className="ios-btn ios-btn-primary">
                                <CheckIcon className="w-5 h-5" /> Concluir
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default Produtos;
