module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.UUID,
    },
    participant_one: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    participant_two: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    last_message_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'chats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Chat;
};
