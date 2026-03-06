exports.handler = async (event) => {
  const { default: fetch } = await import('node-fetch');
  
  try {
    // Тестовий парсер для /proxy/bolt/food.bolt.eu/uk-ua/search?q=чебурек
    const pathParts = event.path.split('/').filter(Boolean);
    const host = pathParts[2]; // bolt або glovo
    const targetPath = '/' + pathParts.slice(3).join('/');
    const targetUrl = `https://${host}.com${targetPath}`;
    
    console.log('Event path:', event.path);
    console.log('Target URL:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      }
    });
    
    const headers = {};
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes('x-frame-options') && !key.toLowerCase().includes('content-security-policy')) {
        headers[key] = value;
      }
    });
    
    const body = await response.text();
    
    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: `<pre>Error: ${error.message}\\nPath: ${event.path}</pre>` 
    };
  }
};
