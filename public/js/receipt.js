(async function () {
  const payinIdLabel = document.getElementById('payin-id-label');
  const banner = document.getElementById('banner');
  const mount = document.getElementById('receipt-mount');

  function showBanner(kind, message) {
    banner.className = `banner show ${kind}`;
    banner.textContent = message;
  }

  const params = new URLSearchParams(window.location.search);
  const payinId = params.get('payin_id');

  if (!payinId) {
    mount.innerHTML = '';
    showBanner('error', 'No payin_id was provided');
    return;
  }

  payinIdLabel.textContent = payinId;

  try {
    const res = await fetch(`/api/session/receipt?payin_id=${encodeURIComponent(payinId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create a receipt');

    const el = document.createElement('rainforest-payin-receipt');
    el.setAttribute('session-key', data.session_key);
    el.setAttribute('payin-id', payinId);

    mount.innerHTML = '';
    mount.appendChild(el);
  } catch (err) {
    console.error(err);
    mount.innerHTML = '';
    showBanner('error', err.message || 'Could not load receipt');
  }
})();
