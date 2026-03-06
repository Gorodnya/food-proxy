const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Парсимо URL правильно
    const pathParts = event.path.split('/');
    const service = pathParts[2]; // /proxy/bolt/...
    const targetUrl = decodeURIComponent(pathParts.slice(3).join('/'));
    
    console.log('Proxying:', targetUrl); // для логів
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    
    const headers = {};
    response.headers.for.each((value, key) => {
      if (key.toLowerCase() !== 'x-frame-options' && key.toLowerCase() !== 'content-security-policy') {
        headers[key] = value;
      }
    });
    
    const body = await response.text();
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
      body
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: `<h1>Proxy error: ${error.message}</h1>`
    };
  }
};
