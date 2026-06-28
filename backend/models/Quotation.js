module.exports = (sequelize, DataTypes) => {
  const Quotation = sequelize.define('Quotation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    delivery_charge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    valid_until: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('sent', 'viewed', 'accepted', 'rejected', 'expired'),
      defaultValue: 'sent',
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    estimated_prep_time: {
      type: DataTypes.STRING(50),
    },
  }, {
    tableName: 'quotations',
    timestamps: true,
    underscored: true,
  });

  return Quotation;
};
