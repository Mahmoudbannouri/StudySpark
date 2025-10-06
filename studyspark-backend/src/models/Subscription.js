// models/Subscription.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Subscription = sequelize.define("Subscription", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  plan: {
    type: DataTypes.ENUM("free", "basic", "premium", "enterprise"),
    defaultValue: "free",
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "expired", "cancelled"),
    defaultValue: "active",
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['plan'] },
    { fields: ['endDate'] }
  ]
});

export default Subscription;
