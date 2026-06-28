module.exports = (sequelize, DataTypes) => {
  const DeliveryAgent = sequelize.define('DeliveryAgent', {
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
    company_name: {
      type: DataTypes.STRING(255),
    },
    license_number: {
      type: DataTypes.STRING(100),
    },
    service_area_radius: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.00,
    },
    total_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
  }, {
    tableName: 'delivery_agents',
    timestamps: true,
    underscored: true,
  });

  return DeliveryAgent;
};
