module.exports = (sequelize, DataTypes) => {
  const PaymentGatewaySetting = sequelize.define('PaymentGatewaySetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gateway_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'payment_gateway_settings',
    timestamps: true,
    underscored: true,
  });

  return PaymentGatewaySetting;
};
