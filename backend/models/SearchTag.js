module.exports = (sequelize, DataTypes) => {
  const SearchTag = sequelize.define('SearchTag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'search_tags',
    timestamps: false,
  });

  return SearchTag;
};
