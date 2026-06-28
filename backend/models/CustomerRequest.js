module.exports = (sequelize, DataTypes) => {
  const CustomerRequest = sequelize.define('CustomerRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    request_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Customer Request Sent',
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
    urgency: {
      type: DataTypes.ENUM('normal', 'urgent', 'scheduled'),
      defaultValue: 'normal',
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
    },
    scheduled_time: {
      type: DataTypes.TIME,
    },
  }, {
    tableName: 'customer_requests',
    timestamps: true,
    underscored: true,
  });

  return CustomerRequest;
};
