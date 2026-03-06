const fetch = require('node-fetch'); // npm install node-fetch в корені!

exports.handler = async (event, context) => {
  const path = event.path.replace('/proxy/', '');
  const [service, targetUrl] = path.split('/', 2);
  const url = decodeURIComponent(targetUrl);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Видаляємо X-Frame-Options для iframe
    const headers = {};
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes('x-frame-options') && !key.toLowerCase().includes('content-security-policy')) {
        headers[key] = value;
      }
    });
    headers['content-type'] = response.headers.get('content-type') || 'text/html; charset=utf-8';

    let body = await response.text();

    // Додатково модифікуємо CSP якщо є
    body = body.replace(/content-security-policy[^;]*;?/gi, '');

    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (error) {
    return { statusCode: 500, body: 'Proxy error: ' + error.message };
  }
};
