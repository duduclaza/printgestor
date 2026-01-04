import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Dados da Empresa
    nomeFantasia: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    razaoSocial: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    tipoCadastro: {
        type: DataTypes.STRING(20),
        defaultValue: 'Matriz',
    },
    codigoInterno: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    cnpj: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    cpf: {
        type: DataTypes.STRING(14),
        allowNull: true,
    },
    inscricaoEstadual: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    ieIsento: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    inscricaoMunicipal: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    cnae: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    regimeTributario: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    porteEmpresa: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    dataAbertura: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    situacao: {
        type: DataTypes.STRING(20),
        defaultValue: 'Ativo',
    },
    // Informações Fiscais
    ufCadastro: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    tipoContribuinte: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    consumidorFinal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    indicadorIE: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    suframa: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    obsFiscais: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Endereço Principal (Sede)
    cep: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    logradouro: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    complemento: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    bairro: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    cidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    pais: {
        type: DataTypes.STRING(50),
        defaultValue: 'Brasil',
    },
    // Endereço de Entrega
    entregaMesmoEndereco: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    entregaCep: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    entregaLogradouro: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    entregaNumero: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    entregaComplemento: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    entregaBairro: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    entregaCidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    entregaEstado: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    // Endereço de Cobrança
    cobrancaMesmoEndereco: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    cobrancaCep: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    cobrancaLogradouro: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    cobrancaNumero: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    cobrancaComplemento: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    cobrancaBairro: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    cobrancaCidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    cobrancaEstado: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    // Contato Comercial
    contatoNome: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    contatoCargo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    contatoTelefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    contatoWhatsapp: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    contatoEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // Contato Financeiro
    financeiroNome: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    financeiroEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    financeiroTelefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    // Condições Comerciais
    formaPagamento: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    prazoPagamento: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    limiteCredito: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    politicaDesconto: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    tabelaPreco: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    permiteVendaPrazo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Acesso B2B
    usuario: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    senha: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // Campos Internos
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    categoria: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    regiaoRota: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'clientes',
    timestamps: true,
});

export default Cliente;
