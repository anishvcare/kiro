module.exports = (sequelize, DataTypes) => {
  const PaymentScreenshot = sequelize.define('PaymentScreenshot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified_by: {
      type: DataTypes.UUID,
    },
    verified_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'payment_screenshots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return PaymentScreenshot;
};
