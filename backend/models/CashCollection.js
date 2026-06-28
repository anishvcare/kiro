module.exports = (sequelize, DataTypes) => {
  const CashCollection = sequelize.define('CashCollection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    delivery_assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    delivery_boy_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    collected_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    settled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    settled_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'cash_collections',
    timestamps: false,
  });

  return CashCollection;
};
