const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User, Role, UserRole, Customer, sequelize } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../services/tokenService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { verifyIdToken } = require('../services/firebaseService');
const { createOtp, verifyOtp: verifyPhoneOtpCode } = require('../services/phoneOtpService');
const { sendOtp: sendWhatsAppOtp, isWhatsAppConfigured } = require('../services/whatsappService');
const { generateId, formatValidationErrors, apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse(res, 400, 'Validation failed', { errors: formatValidationErrors(errors) });
  }

  const { email, password, first_name, last_name, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return apiResponse(res, 409, 'User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user in a transaction
  const transaction = await sequelize.transaction();

  try {
    const userId = generateId();
    const user = await User.create({
      id: userId,
      email,
      phone,
      password_hash,
      first_name,
      last_name,
    }, { transaction });

    // Assign role
    const roleName = role || 'customer';
    const roleRecord = await Role.findOne({ where: { name: roleName } });

    if (!roleRecord) {
      await transaction.rollback();
      return apiResponse(res, 400, 'Invalid role specified');
    }

    await UserRole.create({
      user_id: userId,
      role_id: roleRecord.id,
    }, { transaction });

    // Create role-specific profile
    if (roleName === 'customer') {
      await Customer.create({
        id: generateId(),
        user_id: userId,
      }, { transaction });
    }

    await transaction.commit();

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      roles: [roleName],
    });

    // Save refresh token
    await user.update({ refresh_token: tokens.refreshToken });

    return apiResponse(res, 201, 'User registered successfully', {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: [roleName],
      },
      tokens,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse(res, 400, 'Validation failed', { errors: formatValidationErrors(errors) });
  }

  const { email, password } = req.body;

  // Find user with roles
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });

  if (!user) {
    return apiResponse(res, 401, 'Invalid email or password');
  }

  if (!user.is_active) {
    return apiResponse(res, 403, 'Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return apiResponse(res, 401, 'Invalid email or password');
  }

  // Get role names
  const roleNames = user.roles.map((r) => r.name);

  // Generate tokens
  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    roles: roleNames,
  });

  // Update refresh token and last login
  await user.update({
    refresh_token: tokens.refreshToken,
    last_login_at: new Date(),
  });

  return apiResponse(res, 200, 'Login successful', {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      roles: roleNames,
    },
    tokens,
  });
});

/**
 * Normalize a raw phone number to E.164. Defaults to India (+91) when no
 * country code is provided (e.g. "9876543210" -> "+919876543210").
 */
const normalizePhone = (raw) => {
  const trimmed = String(raw || '').trim().replace(/[\s-]/g, '');
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/[^0-9]/g, '')}`;
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

/**
 * Find an existing user by phone or onboard a new customer, then issue JWT
 * tokens and send the standard auth response. Shared by all phone-based logins.
 */
const buildPhoneSession = async (res, phone, first_name, last_name) => {
  let user = await User.findOne({
    where: { phone },
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });

  let roleNames;

  if (user) {
    if (!user.is_active) {
      return apiResponse(res, 403, 'Account has been deactivated');
    }
    roleNames = user.roles.map((r) => r.name);
    await user.update({ phone_verified_at: new Date(), last_login_at: new Date() });
  } else {
    // Onboard a new customer using only their verified phone number.
    const transaction = await sequelize.transaction();
    try {
      const userId = generateId();
      // email & password_hash are required columns; generate safe placeholders
      // since phone-auth users do not use email/password to sign in.
      const placeholderEmail = `${phone.replace(/[^0-9]/g, '')}@phone.local`;
      const randomSecret = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(randomSecret, salt);

      user = await User.create({
        id: userId,
        email: placeholderEmail,
        phone,
        password_hash,
        first_name: first_name || 'Customer',
        last_name: last_name || null,
        phone_verified_at: new Date(),
        last_login_at: new Date(),
        is_verified: true,
      }, { transaction });

      const roleRecord = await Role.findOne({ where: { name: 'customer' } });
      if (!roleRecord) {
        await transaction.rollback();
        return apiResponse(res, 500, 'Customer role is not configured');
      }

      await UserRole.create({ user_id: userId, role_id: roleRecord.id }, { transaction });
      await Customer.create({ id: generateId(), user_id: userId }, { transaction });

      await transaction.commit();
      roleNames = ['customer'];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email, roles: roleNames });
  await user.update({ refresh_token: tokens.refreshToken });

  return apiResponse(res, 200, 'Phone login successful', {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      roles: roleNames,
    },
    tokens,
  });
};

/**
 * Request a WhatsApp OTP for a phone number.
 * POST /api/auth/otp/send
 */
const requestPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return apiResponse(res, 400, 'Phone number is required');
  }

  const normalized = normalizePhone(phone);
  if (normalized.replace(/[^0-9]/g, '').length < 10) {
    return apiResponse(res, 400, 'A valid phone number is required');
  }

  let code;
  try {
    code = createOtp(normalized);
  } catch (error) {
    if (error.code === 'otp/cooldown') {
      return apiResponse(res, 429, error.message);
    }
    throw error;
  }

  if (isWhatsAppConfigured()) {
    try {
      await sendWhatsAppOtp(normalized, code);
    } catch (error) {
      console.error('WhatsApp OTP send failed:', error.message);
      return apiResponse(res, 502, 'Failed to send the WhatsApp code. Please try again.');
    }
  } else if (process.env.NODE_ENV === 'production') {
    return apiResponse(res, 503, 'WhatsApp OTP is not configured on the server');
  } else {
    // Development convenience when no WhatsApp provider is configured.
    console.warn(`[DEV] WhatsApp not configured. OTP for ${normalized} is ${code}`);
  }

  const data = { sent: true };
  // Only expose the code when explicitly enabled for local testing.
  if (process.env.OTP_DEBUG === 'true') {
    data.debug_otp = code;
  }
  return apiResponse(res, 200, 'Verification code sent', data);
});

/**
 * Verify a WhatsApp OTP and log the customer in (creating the account if new).
 * POST /api/auth/otp/verify
 */
const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, otp, first_name, last_name } = req.body;
  if (!phone || !otp) {
    return apiResponse(res, 400, 'Phone number and code are required');
  }

  const normalized = normalizePhone(phone);
  const result = verifyPhoneOtpCode(normalized, String(otp).trim());
  if (!result.valid) {
    return apiResponse(res, 400, result.message);
  }

  return buildPhoneSession(res, normalized, first_name, last_name);
});

/**
 * Phone OTP login / onboarding (Firebase Phone Authentication) - kept as an
 * optional alternative to the WhatsApp OTP flow above.
 * POST /api/auth/phone-login
 */
const phoneLogin = asyncHandler(async (req, res) => {
  const { id_token, first_name, last_name } = req.body;

  if (!id_token) {
    return apiResponse(res, 400, 'Firebase ID token is required');
  }

  let decoded;
  try {
    decoded = await verifyIdToken(id_token);
  } catch (error) {
    if (error.code === 'firebase/not-configured') {
      return apiResponse(res, 503, 'Phone login is not configured on the server');
    }
    return apiResponse(res, 401, 'Invalid or expired verification token');
  }

  const phone = decoded.phone_number;
  if (!phone) {
    return apiResponse(res, 400, 'The verification token does not contain a phone number');
  }

  return buildPhoneSession(res, phone, first_name, last_name);
});

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return apiResponse(res, 400, 'Refresh token is required');
  }

  const decoded = verifyRefreshToken(refresh_token);
  if (!decoded) {
    return apiResponse(res, 401, 'Invalid or expired refresh token');
  }

  const user = await User.findOne({
    where: { id: decoded.id, refresh_token },
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });

  if (!user) {
    return apiResponse(res, 401, 'Invalid refresh token');
  }

  const roleNames = user.roles.map((r) => r.name);

  // Generate new token pair
  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    roles: roleNames,
  });

  // Update stored refresh token
  await user.update({ refresh_token: tokens.refreshToken });

  return apiResponse(res, 200, 'Token refreshed successfully', { tokens });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.update(
      { refresh_token: null },
      { where: { id: req.user.id } }
    );
  }

  return apiResponse(res, 200, 'Logged out successfully');
});

/**
 * Forgot password - send reset email
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  // Always respond with success to prevent email enumeration
  if (!user) {
    return apiResponse(res, 200, 'If an account exists with that email, a reset link has been sent');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await user.update({
    reset_password_token: resetPasswordToken,
    reset_password_expires: resetPasswordExpires,
  });

  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (error) {
    console.error('Failed to send reset email:', error.message);
  }

  return apiResponse(res, 200, 'If an account exists with that email, a reset link has been sent');
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse(res, 400, 'Validation failed', { errors: formatValidationErrors(errors) });
  }

  const { token, password } = req.body;

  // Hash the provided token to compare with stored hash
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: { reset_password_token: resetPasswordToken },
  });

  if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
    return apiResponse(res, 400, 'Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  await user.update({
    password_hash,
    reset_password_token: null,
    reset_password_expires: null,
    refresh_token: null,
  });

  return apiResponse(res, 200, 'Password reset successfully');
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ['password_hash', 'refresh_token', 'reset_password_token', 'reset_password_expires'] },
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });

  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  return apiResponse(res, 200, 'User profile retrieved', { user });
});

module.exports = {
  register,
  login,
  requestPhoneOtp,
  verifyPhoneOtp,
  phoneLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
