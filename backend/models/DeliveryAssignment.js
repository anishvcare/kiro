module.exports = (sequelize, DataTypes) => {
  const DeliveryAssignment = sequelize.define('DeliveryAssignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    delivery_boy_id: {
      type: DataTypes.UUID,
    },
    agent_id: {
      type: DataTypes.UUID,
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'),
      defaultValue: 'pending',
    },
    pickup_address: {
      type: DataTypes.TEXT,
    },
    pickup_latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    pickup_longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    delivery_address: {
      type: DataTypes.TEXT,
    },
    delivery_latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    delivery_longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    estimated_delivery_time: {
      type: DataTypes.DATE,
    },
    actual_delivery_time: {
      type: DataTypes.DATE,
    },
    delivery_proof_url: {
      type: DataTypes.STRING(500),
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'delivery_assignments',
    timestamps: true,
    underscored: true,
  });

  return DeliveryAssignment;
};
