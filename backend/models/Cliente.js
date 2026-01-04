import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
    },
    razaoSocial: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    nomeFantasia: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    cnpj: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
    },
    cpf: {
        type: DataTypes.STRING(14),
        allowNull: true,
    },
    inscricaoEstadual: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    celular: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    endereco: {
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
    cep: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    observacoes: {
        type: DataTypes.TEXT,
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
