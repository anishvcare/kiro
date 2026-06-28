const { AdminSetting, AuditLog } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

// Keys used for delivery-related settings
const DELIVERY_SETTING_KEYS = [
  'delivery_base_charge',
  'delivery_per_km_charge',
  'delivery_free_threshold',
  'delivery_max_radius_km',
  'platform_commission_percent',
  'delivery_agent_commission_percent',
  'cash_on_delivery_enabled',
  'minimum_order_amount',
  'delivery_boy_payout_per_delivery',
  'express_delivery_surcharge',
];

/**
 * Get delivery settings
 * GET /api/admin/delivery-settings
 */
const getDeliverySettings = asyncHandler(async (req, res) => {
  const settings = await AdminSetting.findAll({
    where: { setting_key: DELIVERY_SETTING_KEYS },
    order: [['setting_key', 'ASC']],
  });

  // Build a map with defaults
  const settingsMap = {};
  const defaults = {
    delivery_base_charge: '30',
    delivery_per_km_charge: '10',
    delivery_free_threshold: '500',
    delivery_max_radius_km: '15',
    platform_commission_percent: '10',
    delivery_agent_commission_percent: '15',
    cash_on_delivery_enabled: 'true',
    minimum_order_amount: '50',
    delivery_boy_payout_per_delivery: '40',
    express_delivery_surcharge: '50',
  };

  for (const key of DELIVERY_SETTING_KEYS) {
    const found = settings.find((s) => s.setting_key === key);
    settingsMap[key] = found ? found.setting_value : defaults[key];
  }

  return apiResponse(res, 200, 'Delivery settings retrieved', { settings: settingsMap });
});

/**
 * Update delivery settings
 * PUT /api/admin/delivery-settings
 */
const updateDeliverySettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return apiResponse(res, 400, 'Settings object is required');
  }

  const oldSettings = await AdminSetting.findAll({
    where: { setting_key: DELIVERY_SETTING_KEYS },
  });

  const oldMap = {};
  oldSettings.forEach((s) => { oldMap[s.setting_key] = s.setting_value; });

  for (const [key, value] of Object.entries(settings)) {
    if (DELIVERY_SETTING_KEYS.includes(key)) {
      await AdminSetting.upsert({
        setting_key: key,
        setting_value: String(value),
        setting_type: key.includes('enabled') ? 'boolean' : 'number',
        description: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
  }

  await AuditLog.create({
    user_id: req.user.id,
    action: 'update_delivery_settings',
    entity_type: 'admin_settings',
    old_values: oldMap,
    new_values: settings,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  // Return the updated settings
  const updatedSettings = await AdminSetting.findAll({
    where: { setting_key: DELIVERY_SETTING_KEYS },
  });
  const result = {};
  updatedSettings.forEach((s) => { result[s.setting_key] = s.setting_value; });

  return apiResponse(res, 200, 'Delivery settings updated successfully', { settings: result });
});

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
};
