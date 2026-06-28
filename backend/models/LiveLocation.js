module.exports = (sequelize, DataTypes) => {
  const LiveLocation = sequelize.define('LiveLocation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    delivery_assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    delivery_boy_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    accuracy: {
      type: DataTypes.DECIMAL(6, 2),
    },
    speed: {
      type: DataTypes.DECIMAL(6, 2),
    },
    heading: {
      type: DataTypes.DECIMAL(5, 2),
    },
    recorded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'live_locations',
    timestamps: false,
  });

  return LiveLocation;
};
