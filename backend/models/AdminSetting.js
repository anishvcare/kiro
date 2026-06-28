module.exports = (sequelize, DataTypes) => {
  const AdminSetting = sequelize.define('AdminSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    setting_value: {
      type: DataTypes.TEXT,
    },
    setting_type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string',
    },
    description: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'admin_settings',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  });

  return AdminSetting;
};
