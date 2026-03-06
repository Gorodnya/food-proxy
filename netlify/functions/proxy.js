exports.handler = async (event) => {
  const { default: fetch } = await import('node-fetch');
  
  try {
    // Парсинг URL
    const pathParts = event.path.split('/');
    const targetUrl = decodeURIComponent(pathParts.slice(3).join('/'));
    
    console.log('Proxy:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      }
    });
    
    // Фільтр заголовків
    const newHeaders = {};
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (!k.includes('x-frame') && !k.includes('csp') && !k.includes('referrer')) {
        newHeaders[key] = value;
      }
    });
    
    let body = await response.text();
    
    // Фікс CSP/relative links
    body = body.replace(/content-security-policy/gi, 'x-old-csp');
    body = body.replace(/'unsafe-inline'/gi, '*');
    
    return {
      statusCode: response.status,
      headers: { ...newHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      body
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Proxy error: ${error.message}</h1><p>URL: ${event.path}</p>`
    };
  }
};
