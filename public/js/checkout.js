(async function () {
  const amountLabel = document.getElementById('amount-label');
  const banner = document.getElementById('banner');
  const mount = document.getElementById('payment-mount');

  function showBanner(kind, message) {
    banner.className = `banner show ${kind}`;
    banner.textContent = message;
  }

  const params = new URLSearchParams(window.location.search);
  const amount = parseFloat(params.get('amount'));

  amountLabel.textContent = amount.toFixed(2);

  const customerName = sessionStorage.getItem('customerName');
  if (customerName) {
    const label = document.getElementById('customer-name-label');
    label.textContent = customerName;
  }
  try {
    const configRes = await fetch('/api/payin-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, customerName }),
    });
    const configData = await configRes.json();
    if (!configRes.ok) throw new Error(configData.error || 'Could not create payin config');

    const sessionRes = await fetch('/api/session/payment', { method: 'POST' });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) throw new Error(sessionData.error || 'Could not create session');

    mount.innerHTML = '';
    const el = document.createElement('rainforest-payment');
    el.id = 'payment-component';
    el.setAttribute('session-key', sessionData.session_key);
    el.setAttribute('payin-config-id', configData.payin_config_id);
    el.setAttribute('allowed-methods', 'PAYPAL_WALLET,VENMO,APPLE_PAY,CARD,ACH');
    el.setAttribute('style-button-color', '#E8879A');
    mount.appendChild(el);

    el.addEventListener('approved', (event) => {
      const payload = Array.isArray(event.detail) ? event.detail[0] : event.detail;
      const data = payload && payload.data;
      const payinId = (data && (data.payin_id || data.id)) || null;
      showBanner('success', 'Approved! Loading your receipt…');
      window.location.href = `/receipt.html?payin_id=${encodeURIComponent(payinId)}`;
    });

    el.addEventListener('declined', (event) => {
      console.warn('declined event:', event.detail);
      showBanner('error', 'Card Declined. Please try a different card.');
    });

    el.addEventListener('error', (event) => {
      console.error('error event:', event.detail);
      showBanner('error', 'Something went wrong with the payment component.');
    });
  } catch (err) {
    console.error(err);
    mount.innerHTML = '';
    showBanner('error', err.message || 'Could not start checkout.');
  }
})();
