module.exports = (sequelize, DataTypes) => {
  const ShopPaymentAccount = sequelize.define('ShopPaymentAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    account_details: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'shop_payment_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return ShopPaymentAccount;
};
