module.exports = (sequelize, DataTypes) => {
  const PaymentWebhook = sequelize.define('PaymentWebhook', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gateway: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    processed_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'payment_webhooks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return PaymentWebhook;
};
