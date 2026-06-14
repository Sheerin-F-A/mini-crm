const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// CRM URL - In production this would be configurable via env
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:3000/api/receipt';

app.post('/send', (req, res) => {
  const { campaignId, customerId, channel } = req.body;

  if (!campaignId || !customerId) {
    return res.status(400).json({ error: 'campaignId and customerId are required' });
  }

  // 1. Immediately return accepted
  res.json({ accepted: true });

  // 2. Asynchronously simulate delivery events
  // We'll simulate a flow: Sent -> Delivered -> Opened -> Clicked
  // With some randomization for drop-offs
  
  const simulateEvent = (status, delay) => {
    setTimeout(async () => {
      try {
        await fetch(CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            customerId,
            status
          })
        });
        console.log(`Sent webhook for Campaign ${campaignId}, Customer ${customerId}: ${status}`);
      } catch (err) {
        console.error(`Failed to send webhook to CRM: ${err.message}`);
      }
    }, delay);
  };

  // The item is "sent" already upon acceptance (or we can dispatch "sent" immediately)
  
  // 5% chance of failing, 95% chance of delivery
  const isFailed = Math.random() < 0.05;

  if (isFailed) {
    simulateEvent('failed', 1000 + Math.random() * 2000); // Fail between 1-3 seconds
    return;
  }

  // Deliver between 1-3 seconds
  simulateEvent('delivered', 1000 + Math.random() * 2000);

  // 60% chance to open if delivered
  if (Math.random() < 0.6) {
    // Open between 3-6 seconds
    simulateEvent('opened', 3000 + Math.random() * 3000);

    // 30% chance to click if opened
    if (Math.random() < 0.3) {
      // Click between 6-10 seconds
      simulateEvent('clicked', 6000 + Math.random() * 4000);
      
      // 10% chance to convert if clicked
      if (Math.random() < 0.1) {
        simulateEvent('converted', 10000 + Math.random() * 5000);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Channel Service running on http://localhost:${PORT}`);
});
