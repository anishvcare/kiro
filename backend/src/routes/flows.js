const express = require('express');
const router = express.Router();
const Flow = require('../models/Flow');

// Get all flows
router.get('/', async (req, res) => {
  try {
    const flows = await Flow.find().sort({ priority: -1, createdAt: -1 });
    res.json(flows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single flow
router.get('/:id', async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    res.json(flow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new flow
router.post('/', async (req, res) => {
  try {
    const flow = new Flow(req.body);
    await flow.save();
    res.status(201).json(flow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update flow
router.put('/:id', async (req, res) => {
  try {
    const flow = await Flow.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    res.json(flow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete flow
router.delete('/:id', async (req, res) => {
  try {
    const flow = await Flow.findByIdAndDelete(req.params.id);
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    res.json({ message: 'Flow deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle flow on/off
router.patch('/:id/toggle', async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    flow.active = !flow.active;
    await flow.save();
    res.json(flow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed sample flows
router.post('/seed', async (req, res) => {
  try {
    const sampleFlows = [
      {
        name: 'Welcome Message',
        trigger: 'hi',
        triggerType: 'contains',
        active: true,
        priority: 10,
        steps: [
          {
            id: 'welcome',
            message: 'Namaskaram! 🙏 Welcome to our business.\n\nPlease choose:\n1️⃣ Products\n2️⃣ Services\n3️⃣ Contact Us\n4️⃣ Business Hours',
            options: [
              { match: '1', nextStep: 'products', label: 'Products' },
              { match: '2', nextStep: 'services', label: 'Services' },
              { match: '3', nextStep: 'contact', label: 'Contact Us' },
              { match: '4', nextStep: 'hours', label: 'Business Hours' }
            ]
          },
          {
            id: 'products',
            message: '📦 Our Products:\n\n1. Product A - ₹999\n2. Product B - ₹1499\n3. Product C - ₹2499\n\nOrder cheyyaan "order" enn type cheyyuka.\nBack to menu: "hi"',
            options: []
          },
          {
            id: 'services',
            message: '🔧 Our Services:\n\n1. Consultation - Free\n2. Installation - ₹500\n3. Maintenance - ₹299/month\n\nBooking-nu "book" enn type cheyyuka.\nBack to menu: "hi"',
            options: []
          },
          {
            id: 'contact',
            message: '📞 Contact Us:\n\nPhone: +91 XXXXX XXXXX\nEmail: info@yourbusiness.com\nLocation: Your City, Kerala\n\nVisiting: Mon-Sat 9AM-6PM',
            options: []
          },
          {
            id: 'hours',
            message: '🕘 Business Hours:\n\nMon-Sat: 9:00 AM - 6:00 PM\nSunday: Closed\n\n⚡ Online orders 24/7!',
            options: []
          }
        ]
      },
      {
        name: 'Price Enquiry',
        trigger: 'price',
        triggerType: 'contains',
        active: true,
        priority: 5,
        steps: [
          {
            id: 'price',
            message: '💰 Price List:\n\n📦 Product A - ₹999\n📦 Product B - ₹1499\n📦 Product C - ₹2499\n\n🔧 Service Pack - ₹299/month\n\nOrder cheyyaan "order" type cheyyuka.',
            options: []
          }
        ]
      },
      {
        name: 'Thank You',
        trigger: 'thank',
        triggerType: 'contains',
        active: true,
        priority: 3,
        steps: [
          {
            id: 'thanks',
            message: 'You\'re welcome! 😊🙏\n\nVere enthenkium help venamenkil message cheyyuka.\n\nHave a great day! ✨',
            options: []
          }
        ]
      },
      {
        name: 'Default Reply',
        trigger: '*',
        triggerType: 'default',
        active: true,
        priority: 0,
        steps: [
          {
            id: 'default',
            message: 'Thanks for your message! 🙏\n\nNjangalude team udane reply cheyyum.\n\nQuick options:\n👉 "hi" - Main menu\n👉 "price" - Price list\n\nWorking hours: Mon-Sat 9AM-6PM',
            options: []
          }
        ]
      }
    ];

    await Flow.deleteMany({});
    const flows = await Flow.insertMany(sampleFlows);
    res.json({ message: 'Sample flows created!', count: flows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
