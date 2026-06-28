module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category_id: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    city: {
      type: DataTypes.STRING(100),
    },
    pincode: {
      type: DataTypes.STRING(10),
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    whatsapp: {
      type: DataTypes.STRING(20),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    logo_url: {
      type: DataTypes.STRING(500),
    },
    banner_url: {
      type: DataTypes.STRING(500),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    opening_time: {
      type: DataTypes.TIME,
    },
    closing_time: {
      type: DataTypes.TIME,
    },
    working_days: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'shops',
    timestamps: true,
    underscored: true,
  });

  return Shop;
};
