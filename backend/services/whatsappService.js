/**
 * WhatsApp messaging service - sends OTP codes over WhatsApp.
 *
 * Default provider: Meta WhatsApp Cloud API (official). It is provider-agnostic
 * via WHATSAPP_PROVIDER so a BSP (MSG91 / Gupshup / Twilio / AiSensy) can be
 * plugged in later without changing callers.
 *
 * Required env for the default 'meta' provider:
 *   WHATSAPP_PROVIDER=meta                 (default)
 *   WHATSAPP_PHONE_NUMBER_ID=<from Meta>   (the WABA phone number id)
 *   WHATSAPP_ACCESS_TOKEN=<permanent token>
 *   WHATSAPP_OTP_TEMPLATE=<approved authentication template name>
 *   WHATSAPP_OTP_TEMPLATE_LANG=en          (template language code)
 *   WHATSAPP_API_VERSION=v21.0             (optional)
 *
 * The template MUST be an "Authentication" category template that contains the
 * code in its body and a one-tap "Copy code" URL button. We pass the code as
 * both the body parameter and the button parameter, per Meta's spec.
 */

const PROVIDER = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase();

/**
 * Whether the WhatsApp sender is configured for the selected provider.
 */
const isWhatsAppConfigured = () => {
  if (PROVIDER === 'meta') {
    return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
  }
  return false;
};

const sendViaMeta = async (phone, code) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const template = process.env.WHATSAPP_OTP_TEMPLATE || 'otp_verification';
  const lang = process.env.WHATSAPP_OTP_TEMPLATE_LANG || 'en';
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const to = String(phone).replace(/[^0-9]/g, '');

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template,
      language: { code: lang },
      components: [
        // The verification code shown in the message body
        { type: 'body', parameters: [{ type: 'text', text: code }] },
        // The one-tap "Copy code" button (index 0) also carries the code
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: code }],
        },
      ],
    },
  };

  if (typeof fetch !== 'function') {
    throw new Error('global fetch is unavailable; Node 18+ is required for WhatsApp sending');
  }

  const resp = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`WhatsApp Cloud API error ${resp.status}: ${text}`);
  }

  return resp.json();
};

/**
 * Send an OTP code to a phone number over WhatsApp.
 * @param {string} phone - E.164 phone number
 * @param {string} code - the OTP code
 */
const sendOtp = async (phone, code) => {
  if (PROVIDER === 'meta') {
    return sendViaMeta(phone, code);
  }
  throw new Error(`Unsupported WHATSAPP_PROVIDER: ${PROVIDER}`);
};

module.exports = { sendOtp, isWhatsAppConfigured, PROVIDER };
