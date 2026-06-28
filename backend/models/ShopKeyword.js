module.exports = (sequelize, DataTypes) => {
  const ShopKeyword = sequelize.define('ShopKeyword', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'shop_keywords',
    timestamps: false,
  });

  return ShopKeyword;
};
