exports.handler = async (event) => {
  const { default: fetch } = await import('node-fetch');
  
  try {
    const pathParts = event.path.split('/');
    const targetUrl = decodeURIComponent(pathParts.slice(3).join('/'));
    
    console.log('Proxying:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      }
    });
    
    const headers = {};
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes('x-frame-options') && !key.toLowerCase().includes('content-security-policy')) {
        headers[key] = value;
      }
    });
    
    const body = await response.text();

    // Фікс CSP для iframe
body = body.replace(/<head>/i, '<head><base href="' + targetUrl.split('/').slice(0,3).join('/') + '/">');
body = body.replace(/content-security-policy-report-only/i, 'x-content-security-policy-report-only');
body = body.replace(/script-src[^;]*/gi, 'script-src *');

    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
      body
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: `Proxy error: ${error.message}` };
  }
};
