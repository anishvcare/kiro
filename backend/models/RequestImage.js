module.exports = (sequelize, DataTypes) => {
  const RequestImage = sequelize.define('RequestImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'request_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return RequestImage;
};
