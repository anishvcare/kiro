module.exports = (sequelize, DataTypes) => {
  const PaymentTransaction = sequelize.define('PaymentTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    gateway_transaction_id: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.ENUM('initiated', 'pending', 'success', 'failed', 'refunded'),
      defaultValue: 'initiated',
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'payment_transactions',
    timestamps: true,
    underscored: true,
  });

  return PaymentTransaction;
};
