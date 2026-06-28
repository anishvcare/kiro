module.exports = (sequelize, DataTypes) => {
  const UpiPaymentLog = sequelize.define('UpiPaymentLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    upi_id: {
      type: DataTypes.STRING(255),
    },
    upi_ref_number: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.STRING(50),
    },
    response_data: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'upi_payment_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return UpiPaymentLog;
};
