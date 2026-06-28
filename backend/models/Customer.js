module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    default_address: {
      type: DataTypes.TEXT,
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
    preferences: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  });

  return Customer;
};
