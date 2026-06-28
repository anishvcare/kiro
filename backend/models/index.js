const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Permission = require('./Permission')(sequelize, DataTypes);
const UserRole = require('./UserRole')(sequelize, DataTypes);
const RolePermission = require('./RolePermission')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const Shop = require('./Shop')(sequelize, DataTypes);
const ShopCategory = require('./ShopCategory')(sequelize, DataTypes);
const ShopKeyword = require('./ShopKeyword')(sequelize, DataTypes);
const SearchTag = require('./SearchTag')(sequelize, DataTypes);
const DeliveryAgent = require('./DeliveryAgent')(sequelize, DataTypes);
const DeliveryBoy = require('./DeliveryBoy')(sequelize, DataTypes);
const CustomerRequest = require('./CustomerRequest')(sequelize, DataTypes);
const RequestImage = require('./RequestImage')(sequelize, DataTypes);
const Quotation = require('./Quotation')(sequelize, DataTypes);
const QuotationItem = require('./QuotationItem')(sequelize, DataTypes);
const PaymentMethod = require('./PaymentMethod')(sequelize, DataTypes);
const ShopPaymentAccount = require('./ShopPaymentAccount')(sequelize, DataTypes);
const PaymentGatewaySetting = require('./PaymentGatewaySetting')(sequelize, DataTypes);
const PaymentTransaction = require('./PaymentTransaction')(sequelize, DataTypes);
const UpiPaymentLog = require('./UpiPaymentLog')(sequelize, DataTypes);
const PaymentWebhook = require('./PaymentWebhook')(sequelize, DataTypes);
const PaymentScreenshot = require('./PaymentScreenshot')(sequelize, DataTypes);
const DeliveryAssignment = require('./DeliveryAssignment')(sequelize, DataTypes);
const CashCollection = require('./CashCollection')(sequelize, DataTypes);
const SettlementTransaction = require('./SettlementTransaction')(sequelize, DataTypes);
const Chat = require('./Chat')(sequelize, DataTypes);
const Message = require('./Message')(sequelize, DataTypes);
const LiveLocation = require('./LiveLocation')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const Rating = require('./Rating')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const ServiceArea = require('./ServiceArea')(sequelize, DataTypes);
const AdminSetting = require('./AdminSetting')(sequelize, DataTypes);
const SupportTicket = require('./SupportTicket')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);

// ===== ASSOCIATIONS =====

// User - Roles (many-to-many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' });

// Role - Permissions (many-to-many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id', as: 'roles' });

// User - Customer (one-to-one)
User.hasOne(Customer, { foreignKey: 'user_id', as: 'customerProfile' });
Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Shop (one-to-many)
User.hasMany(Shop, { foreignKey: 'owner_id', as: 'shops' });
Shop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// ShopCategory - Shop
ShopCategory.hasMany(Shop, { foreignKey: 'category_id', as: 'shops' });
Shop.belongsTo(ShopCategory, { foreignKey: 'category_id', as: 'category' });

// Shop - Keywords
Shop.hasMany(ShopKeyword, { foreignKey: 'shop_id', as: 'keywords' });
ShopKeyword.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// SearchTag - ShopCategory
ShopCategory.hasMany(SearchTag, { foreignKey: 'category_id', as: 'searchTags' });
SearchTag.belongsTo(ShopCategory, { foreignKey: 'category_id', as: 'category' });

// User - DeliveryAgent
User.hasOne(DeliveryAgent, { foreignKey: 'user_id', as: 'deliveryAgentProfile' });
DeliveryAgent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - DeliveryBoy
User.hasOne(DeliveryBoy, { foreignKey: 'user_id', as: 'deliveryBoyProfile' });
DeliveryBoy.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// DeliveryAgent - DeliveryBoy
DeliveryAgent.hasMany(DeliveryBoy, { foreignKey: 'agent_id', as: 'deliveryBoys' });
DeliveryBoy.belongsTo(DeliveryAgent, { foreignKey: 'agent_id', as: 'agent' });

// Customer - CustomerRequest
Customer.hasMany(CustomerRequest, { foreignKey: 'customer_id', as: 'requests' });
CustomerRequest.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Shop - CustomerRequest
Shop.hasMany(CustomerRequest, { foreignKey: 'shop_id', as: 'requests' });
CustomerRequest.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// CustomerRequest - RequestImage
CustomerRequest.hasMany(RequestImage, { foreignKey: 'request_id', as: 'images' });
RequestImage.belongsTo(CustomerRequest, { foreignKey: 'request_id', as: 'request' });

// CustomerRequest - Quotation
CustomerRequest.hasMany(Quotation, { foreignKey: 'request_id', as: 'quotations' });
Quotation.belongsTo(CustomerRequest, { foreignKey: 'request_id', as: 'request' });

// Shop - Quotation
Shop.hasMany(Quotation, { foreignKey: 'shop_id', as: 'quotations' });
Quotation.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// Quotation - QuotationItem
Quotation.hasMany(QuotationItem, { foreignKey: 'quotation_id', as: 'items' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });

// Shop - ShopPaymentAccount
Shop.hasMany(ShopPaymentAccount, { foreignKey: 'shop_id', as: 'paymentAccounts' });
ShopPaymentAccount.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// PaymentMethod - ShopPaymentAccount
PaymentMethod.hasMany(ShopPaymentAccount, { foreignKey: 'payment_method_id', as: 'accounts' });
ShopPaymentAccount.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'method' });

// PaymentTransaction associations
Quotation.hasMany(PaymentTransaction, { foreignKey: 'quotation_id', as: 'transactions' });
PaymentTransaction.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
Customer.hasMany(PaymentTransaction, { foreignKey: 'customer_id', as: 'transactions' });
PaymentTransaction.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Shop.hasMany(PaymentTransaction, { foreignKey: 'shop_id', as: 'transactions' });
PaymentTransaction.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// UPI Payment Log
PaymentTransaction.hasMany(UpiPaymentLog, { foreignKey: 'transaction_id', as: 'upiLogs' });
UpiPaymentLog.belongsTo(PaymentTransaction, { foreignKey: 'transaction_id', as: 'transaction' });

// Payment Screenshot
PaymentTransaction.hasMany(PaymentScreenshot, { foreignKey: 'transaction_id', as: 'screenshots' });
PaymentScreenshot.belongsTo(PaymentTransaction, { foreignKey: 'transaction_id', as: 'transaction' });

// DeliveryAssignment
PaymentTransaction.hasOne(DeliveryAssignment, { foreignKey: 'transaction_id', as: 'deliveryAssignment' });
DeliveryAssignment.belongsTo(PaymentTransaction, { foreignKey: 'transaction_id', as: 'transaction' });
DeliveryBoy.hasMany(DeliveryAssignment, { foreignKey: 'delivery_boy_id', as: 'assignments' });
DeliveryAssignment.belongsTo(DeliveryBoy, { foreignKey: 'delivery_boy_id', as: 'deliveryBoy' });
DeliveryAgent.hasMany(DeliveryAssignment, { foreignKey: 'agent_id', as: 'assignments' });
DeliveryAssignment.belongsTo(DeliveryAgent, { foreignKey: 'agent_id', as: 'agent' });

// CashCollection
DeliveryAssignment.hasMany(CashCollection, { foreignKey: 'delivery_assignment_id', as: 'cashCollections' });
CashCollection.belongsTo(DeliveryAssignment, { foreignKey: 'delivery_assignment_id', as: 'assignment' });
DeliveryBoy.hasMany(CashCollection, { foreignKey: 'delivery_boy_id', as: 'cashCollections' });
CashCollection.belongsTo(DeliveryBoy, { foreignKey: 'delivery_boy_id', as: 'deliveryBoy' });

// Chat & Messages
CustomerRequest.hasMany(Chat, { foreignKey: 'request_id', as: 'chats' });
Chat.belongsTo(CustomerRequest, { foreignKey: 'request_id', as: 'request' });
Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Live Location
DeliveryAssignment.hasMany(LiveLocation, { foreignKey: 'delivery_assignment_id', as: 'locations' });
LiveLocation.belongsTo(DeliveryAssignment, { foreignKey: 'delivery_assignment_id', as: 'assignment' });
DeliveryBoy.hasMany(LiveLocation, { foreignKey: 'delivery_boy_id', as: 'locations' });
LiveLocation.belongsTo(DeliveryBoy, { foreignKey: 'delivery_boy_id', as: 'deliveryBoy' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Ratings & Reviews
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratingsGiven' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Rating.hasOne(Review, { foreignKey: 'rating_id', as: 'review' });
Review.belongsTo(Rating, { foreignKey: 'rating_id', as: 'rating' });

// Support Tickets
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'tickets' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Audit Logs
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Customer,
  Shop,
  ShopCategory,
  ShopKeyword,
  SearchTag,
  DeliveryAgent,
  DeliveryBoy,
  CustomerRequest,
  RequestImage,
  Quotation,
  QuotationItem,
  PaymentMethod,
  ShopPaymentAccount,
  PaymentGatewaySetting,
  PaymentTransaction,
  UpiPaymentLog,
  PaymentWebhook,
  PaymentScreenshot,
  DeliveryAssignment,
  CashCollection,
  SettlementTransaction,
  Chat,
  Message,
  LiveLocation,
  Notification,
  Rating,
  Review,
  ServiceArea,
  AdminSetting,
  SupportTicket,
  AuditLog,
};
