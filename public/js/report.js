(async function () {
  const banner = document.getElementById('banner');
  const mount = document.getElementById('report-mount');
  const depositMount = document.getElementById('deposit-mount');
  const depositBtn = document.getElementById('deposit-btn');

  const tabs = {
    payment: { tab: document.getElementById('tab-payment'), panel: document.getElementById('panel-payment') },
    deposit: { tab: document.getElementById('tab-deposit'), panel: document.getElementById('panel-deposit') },
  };

  function selectTab(name) {
    for (const [key, { tab, panel }] of Object.entries(tabs)) {
      const active = key === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      panel.hidden = !active;
    }
  }

  Object.entries(tabs).forEach(([name, { tab }]) => {
    tab.addEventListener('click', () => selectTab(name));
  });

  function showBanner(kind, message) {
    banner.className = `banner show ${kind}`;
    banner.textContent = message;
  }

  async function loadPaymentReport() {
    try {
      const res = await fetch('/api/session/report', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create a report session');

      const el = document.createElement('rainforest-payment-report');
      el.setAttribute('session-key', data.session_key);
      el.setAttribute('data-filters', JSON.stringify({ merchant_id: [data.merchant_id] }));
      el.setAttribute('display-records', '10');

      mount.innerHTML = '';
      mount.appendChild(el);
    } catch (err) {
      console.error(err);
      mount.innerHTML = '';
      showBanner('error', err.message || 'Could not load the report');
    }
  }

  async function loadDepositReport() {
    try {
      const res = await fetch('/api/session/deposit-report', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create a deposit report session');

      const el = document.createElement('rainforest-deposit-report');
      el.setAttribute('session-key', data.session_key);
      el.setAttribute('data-filters', JSON.stringify({ merchant_id: data.merchant_id }));
      el.setAttribute('show-export-button', 'true');
      el.setAttribute('show-record-count-selector', 'true');

      depositMount.innerHTML = '';
      depositMount.appendChild(el);
    } catch (err) {
      console.error(err);
      depositMount.innerHTML = '';
      showBanner('error', err.message || 'Could not load the deposit report');
    }
  }

  await Promise.all([loadPaymentReport(), loadDepositReport()]);

  depositBtn.addEventListener('click', async () => {
    depositBtn.disabled = true;
    try {
      const simRes = await fetch('/api/simulate-deposit', { method: 'POST' });
      const simData = await simRes.json();
      if (!simRes.ok) throw new Error(simData.error || 'Could not simulate a deposit');

      await loadDepositReport();
      showBanner('success', 'Deposit simulated!');
    } catch (err) {
      console.error(err);
      showBanner('error', err.message || 'Could not simulate a deposit.');
    } finally {
      depositBtn.disabled = false;
    }
  });
})();
