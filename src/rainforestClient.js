const BASE_URL = process.env.RAINFOREST_BASE_URL;
const API_KEY = process.env.RAINFOREST_API_KEY;


async function rainforestFetch(urlPath, { method = 'GET', body, apiVersion } = {}) {
  if (!API_KEY) {
    throw new Error(
      'no api key'
    );
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (apiVersion) headers['Rainforest-Api-Version'] = apiVersion;

  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed = null;
  let parseFailed = false;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parseFailed = true;
    }
  }

  if (!res.ok || parseFailed) {
    const message = parseFailed
      ? `non-JSON response: ${text.slice(0, 300)}`
      : (parsed && parsed.errors && JSON.stringify(parsed.errors)) ||
        text ||
        `Rainforest API request failed with status ${res.status}`;
    const err = new Error(`Rainforest API error (${res.status}): ${message}`);
    err.status = res.ok ? 502 : res.status;
    err.data = parsed;
    throw err;
  }

  return parsed;
}


function unwrap(envelope) {
  if (envelope === null) return null;
  if (envelope && envelope.errors) {
    throw new Error(`Rainforest API returned errors: ${JSON.stringify(envelope.errors)}`);
  }
  return envelope && Object.prototype.hasOwnProperty.call(envelope, 'data')
    ? envelope.data
    : envelope;
}

module.exports = { rainforestFetch, unwrap };
