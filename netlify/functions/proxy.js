exports.handler = async (event) => {
  const { default: fetch } = await import('node-fetch');
  
  try {
    // Фікс парсингу: event.rawPath для повного шляху
    const fullPath = event.rawPath || event.path;
    const pathParts = fullPath.split('/').filter(p => p); // видаляємо порожні
    if (pathParts.length < 3) {
      throw new Error('Invalid proxy path. Use /proxy/service/url');
    }
    
    const service = pathParts[1];
    const targetPath = pathParts.slice(2).join('/');
    const targetUrl = 'https://' + decodeURIComponent(targetPath);
    
    console.log('Proxy service:', service, 'URL:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,*/*;q=0.9'
      }
    });
    
    const newHeaders = {};
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (!['x-frame-options', 'content-security-policy', 'referrer-policy'].includes(k)) {
        newHeaders[key] = value;
      }
    });
    
    let body = await response.text();
    
    // CSP фікс
    body = body.replace(/content-security-policy-report-only?/gi, '');
    
    return {
      statusCode: response.status,
      headers: newHeaders,
      body
    };
  } catch (error) {
    console.error('Full error:', error);
    return {
      statusCode: 500,
      body: `<pre>Proxy error: ${error.message}
Path: ${JSON.stringify(event.path)}
Full path: ${JSON.stringify(event.rawPath || event.path)}</pre>`
    };
  }
};
