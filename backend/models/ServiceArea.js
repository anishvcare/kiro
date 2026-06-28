module.exports = (sequelize, DataTypes) => {
  const ServiceArea = sequelize.define('ServiceArea', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
    },
    pincode: {
      type: DataTypes.STRING(10),
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    radius_km: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'service_areas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return ServiceArea;
};
