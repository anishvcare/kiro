module.exports = (sequelize, DataTypes) => {
  const DeliveryBoy = sequelize.define('DeliveryBoy', {
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
    agent_id: {
      type: DataTypes.UUID,
    },
    vehicle_type: {
      type: DataTypes.ENUM('bike', 'scooter', 'bicycle', 'car', 'van'),
      defaultValue: 'bike',
    },
    vehicle_number: {
      type: DataTypes.STRING(50),
    },
    license_number: {
      type: DataTypes.STRING(100),
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    current_latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    current_longitude: {
      type: DataTypes.DECIMAL(11, 8),
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
    tableName: 'delivery_boys',
    timestamps: true,
    underscored: true,
  });

  return DeliveryBoy;
};
