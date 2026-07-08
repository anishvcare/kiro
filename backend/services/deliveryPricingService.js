/**
 * Delivery pricing service.
 *
 * Computes the delivery charge from the distance (shop -> customer) and the
 * order's approximate weight, using admin-configurable rates:
 *
 *   delivery_charge = base_charge
 *                   + (per_km_charge  * distance_km)
 *                   + (per_kg_charge  * weight_kg)
 *
 * All three rates are stored in admin_settings and editable in the admin panel:
 *   - delivery_base_charge
 *   - delivery_per_km_charge
 *   - delivery_per_kg_charge
 */

const { AdminSetting } = require('../models');
const geoService = require('./geoService');

const DEFAULTS = {
  delivery_base_charge: 30,
  delivery_per_km_charge: 8,
  delivery_per_kg_charge: 5,
};

/**
 * Load the delivery pricing rates from admin settings (with sensible defaults).
 */
const getPricingRates = async () => {
  const keys = Object.keys(DEFAULTS);
  const rows = await AdminSetting.findAll({ where: { setting_key: keys } });
  const rates = { ...DEFAULTS };
  rows.forEach((row) => {
    const val = parseFloat(row.setting_value);
    if (!Number.isNaN(val)) rates[row.setting_key] = val;
  });
  return rates;
};

/**
 * Calculate the delivery charge.
 * @param {object} params
 * @param {number} params.distanceKm - distance between shop and customer (km)
 * @param {number} params.weightKg - approximate order weight (kg)
 * @param {object} [rates] - optional pre-loaded rates (else loaded from settings)
 * @returns {Promise<{ charge: number, distanceKm: number, weightKg: number, rates: object }>}
 */
const calculateDeliveryCharge = async ({ distanceKm = 0, weightKg = 0 }, rates = null) => {
  const r = rates || (await getPricingRates());

  const d = Math.max(0, parseFloat(distanceKm) || 0);
  const w = Math.max(0, parseFloat(weightKg) || 0);

  let charge = r.delivery_base_charge
    + r.delivery_per_km_charge * d
    + r.delivery_per_kg_charge * w;

  // Round up to the nearest rupee, never negative.
  charge = Math.max(0, Math.ceil(charge));

  return { charge, distanceKm: Number(d.toFixed(2)), weightKg: Number(w.toFixed(2)), rates: r };
};

/**
 * Compute the distance (km) between a shop and a customer request's delivery
 * location. Returns 0 if either set of coordinates is missing.
 * @param {object} shop - Shop instance (latitude/longitude)
 * @param {object} request - CustomerRequest instance (delivery_latitude/longitude)
 */
const distanceForOrder = (shop, request) => {
  const sLat = parseFloat(shop?.latitude);
  const sLon = parseFloat(shop?.longitude);
  const cLat = parseFloat(request?.delivery_latitude);
  const cLon = parseFloat(request?.delivery_longitude);

  if ([sLat, sLon, cLat, cLon].some((v) => Number.isNaN(v))) {
    return 0;
  }
  return geoService.calculateDistance(sLat, sLon, cLat, cLon);
};

module.exports = {
  getPricingRates,
  calculateDeliveryCharge,
  distanceForOrder,
  DEFAULTS,
};
