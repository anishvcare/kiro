module.exports = (sequelize, DataTypes) => {
  const SettlementTransaction = sequelize.define('SettlementTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    from_type: {
      type: DataTypes.ENUM('platform', 'delivery_agent', 'delivery_boy'),
      allowNull: false,
    },
    from_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    to_type: {
      type: DataTypes.ENUM('shop', 'delivery_agent', 'delivery_boy', 'platform'),
      allowNull: false,
    },
    to_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.STRING(50),
    },
    reference_id: {
      type: DataTypes.UUID,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'settlement_transactions',
    timestamps: true,
    underscored: true,
  });

  return SettlementTransaction;
};
