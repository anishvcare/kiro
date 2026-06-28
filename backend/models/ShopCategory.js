module.exports = (sequelize, DataTypes) => {
  const ShopCategory = sequelize.define('ShopCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    icon: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.STRING(255),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'shop_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return ShopCategory;
};
