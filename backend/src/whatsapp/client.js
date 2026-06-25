/**
 * WhatsApp Client using Baileys
 * ✅ cPanel Shared Hosting Compatible (No Chromium/Puppeteer needed!)
 * ✅ Lightweight - runs on minimal resources
 */

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino');
const path = require('path');
const { processMessage } = require('../flows/engine');
const Contact = require('../models/Contact');
const Chat = require('../models/Chat');

let sock = null;
let io = null;

const AUTH_FOLDER = path.join(__dirname, '../../auth_info');

async function initWhatsApp(socketIo) {
  io = socketIo;
  await connectWhatsApp();
}

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['WA CRM Bot', 'Chrome', '120.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 30000
  });

  // Connection state changes
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 QR Code generated - scan with WhatsApp');
      try {
        const qrImage = await qrcode.toDataURL(qr);
        io.emit('qr', qrImage);
        io.emit('status', { status: 'waiting_scan', message: 'QR Code scan cheyyuka 📱' });
      } catch (err) {
        console.error('QR generation error:', err.message);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`❌ Disconnected. Code: ${statusCode}. Reconnect: ${shouldReconnect}`);
      global.whatsappReady = false;

      if (shouldReconnect) {
        io.emit('status', { status: 'disconnected', message: 'Reconnecting...' });
        setTimeout(() => connectWhatsApp(), 5000);
      } else {
        io.emit('status', { status: 'disconnected', message: 'Logged out. QR scan cheyyuka.' });
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Connected!');
      global.whatsappReady = true;
      global.whatsappClient = sock;
      io.emit('status', { status: 'connected', message: 'WhatsApp connected aayi! ✅' });
    }
  });

  // Save auth credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      // Skip our own messages, status broadcasts, and empty messages
      if (!message.message || message.key.fromMe) continue;
      if (message.key.remoteJid === 'status@broadcast') continue;
      if (message.key.remoteJid.endsWith('@g.us')) continue; // Skip groups

      const phone = message.key.remoteJid.replace('@s.whatsapp.net', '');

      // Extract text from various message types
      const text = message.message.conversation ||
                   message.message.extendedTextMessage?.text ||
                   message.message.buttonsResponseMessage?.selectedDisplayText ||
                   message.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   message.message.templateButtonReplyMessage?.selectedDisplayText ||
                   '';

      if (!text.trim()) continue;

      const contactName = message.pushName || phone;

      try {
        // Save/Update contact in DB
        await Contact.findOneAndUpdate(
          { phone },
          {
            phone,
            name: contactName,
            lastMessage: text,
            lastMessageAt: new Date(),
            $inc: { messageCount: 1 }
          },
          { upsert: true, new: true }
        );

        // Save incoming message
        await new Chat({
          phone,
          contactName,
          message: text,
          direction: 'incoming',
          timestamp: new Date()
        }).save();

        // Emit to frontend (live update)
        io.emit('new_message', {
          phone,
          name: contactName,
          message: text,
          direction: 'incoming',
          timestamp: new Date()
        });

        // Process auto-reply flow
        const reply = await processMessage(text, phone);
        if (reply) {
          // Small delay to look natural
          await new Promise(resolve => setTimeout(resolve, 1000));

          await sock.sendMessage(message.key.remoteJid, { text: reply });

          // Save outgoing message
          await new Chat({
            phone,
            contactName,
            message: reply,
            direction: 'outgoing',
            timestamp: new Date()
          }).save();

          // Emit to frontend
          io.emit('new_message', {
            phone,
            name: contactName,
            message: reply,
            direction: 'outgoing',
            timestamp: new Date()
          });

          console.log(`💬 Auto-replied to ${contactName}: ${reply.substring(0, 50)}...`);
        }
      } catch (error) {
        console.error('Message handling error:', error.message);
      }
    }
  });
}

// Send message manually (from dashboard)
async function sendMessage(phone, text) {
  if (!sock || !global.whatsappReady) {
    throw new Error('WhatsApp not connected');
  }
  const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}

function getClient() {
  return sock;
}

function restartClient() {
  if (sock) {
    sock.end();
  }
  setTimeout(() => connectWhatsApp(), 2000);
}

module.exports = { initWhatsApp, getClient, sendMessage, restartClient };
