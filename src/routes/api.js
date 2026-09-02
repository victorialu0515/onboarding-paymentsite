const express = require('express');
const { randomUUID } = require('crypto');

const { rainforestFetch, unwrap } = require('../rainforestClient');

const router = express.Router();
const MERCHANT_ID = process.env.RAINFOREST_MERCHANT_ID;

router.post('/payin-config', async (req, res) => {
  try {
    const { amount, customerName } = req.body || {};
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number (in dollars)' });
    }

    const amount_cents = Math.round(amount * 100);

    const envelope = await rainforestFetch('/payin_configs', {
      method: 'POST',
      body: {
        merchant_id: MERCHANT_ID,
        idempotency_key: randomUUID(),
        amount: amount_cents,
        currency_code: 'USD',
        ...(customerName
          ? {
              billing_contact: { name: customerName },
              metadata: { customer_name: customerName },
            }
          : {}),
      },
    });
    const payinConfig = unwrap(envelope);
    const payinConfigId = payinConfig.payin_config_id || payinConfig.id;

    res.json({ payin_config_id: payinConfigId, amount_cents });
  } catch (err) {
    console.error('[payin-config]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/session/payment', async (req, res) => {
  try {

    const envelope = await rainforestFetch('/sessions', {
      method: 'POST',
      body: {
        ttl: 3600,
        statements: [
          {
            permissions: ['group#payment_component'],
            constraints: { merchant: { merchant_id: MERCHANT_ID } },
          },
        ],
      },
    });
    const session = unwrap(envelope);
    res.json({ session_key: session.session_key });
  } catch (err) {
    console.error('[session/payment]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/session/receipt', async (req, res) => {
  try {
    const { payin_id } = req.query;
    if (!payin_id) {
      return res.status(400).json({ error: 'payin_id query parameter is required' });
    }

    const envelope = await rainforestFetch('/sessions', {
      method: 'POST',
      body: {
        ttl: 3600,
        statements: [
          {
            permissions: ['group#payin_receipt_component'],
            constraints: { payin: { payin_id } },
          },
        ],
      },
    });
    const session = unwrap(envelope);
    res.json({ session_key: session.session_key });
  } catch (err) {
    console.error('[session/receipt]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/session/report', async (req, res) => {
  try {
    const envelope = await rainforestFetch('/sessions', {
      method: 'POST',
      body: {
        ttl: 3600,
        statements: [
          {
            permissions: ['group#payment_report_component'],
            constraints: { merchant: { merchant_id: MERCHANT_ID } },
          },
        ],
      },
    });
    const session = unwrap(envelope);
    res.json({ session_key: session.session_key, merchant_id: MERCHANT_ID });
  } catch (err) {
    console.error('[session/report]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/session/deposit-report', async (req, res) => {
  try {
    const envelope = await rainforestFetch('/sessions', {
      method: 'POST',
      body: {
        ttl: 3600,
        statements: [
          {
            permissions: ['group#deposit_report_component'],
            constraints: { merchant: { merchant_id: MERCHANT_ID } },
          },
        ],
      },
    });
    const session = unwrap(envelope);
    res.json({ session_key: session.session_key, merchant_id: MERCHANT_ID });
  } catch (err) {
    console.error('[session/deposit-report]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/simulate-deposit', async (req, res) => {
  try {
    await rainforestFetch(`/merchants/${MERCHANT_ID}/simulate_deposit`, { method: 'POST' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[simulate-deposit]', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
