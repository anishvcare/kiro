/**
 * One-off admin utility to set a user's password by email.
 *
 * Usage (run from the backend directory, on a machine/host that has DB access
 * and the app's environment configured):
 *
 *   node scripts/set-password.js <email> <newPassword>
 *
 * Example:
 *   node scripts/set-password.js agent1@test.com password123
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

(async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/set-password.js <email> <newPassword>');
    process.exit(1);
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(String(password), salt);
    await user.update({ password_hash, refresh_token: null });

    console.log(`✔ Password updated for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to set password:', error.message);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch (_e) { /* ignore */ }
  }
})();
