// Cloudflare Worker - Elixir API Proxy
// Deploy to: workers.cloudflare.com
// Worker name: elixir-proxy (or your choice)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://kraftinacos.github.io',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Encryption-Key, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // Strip /proxy prefix and forward to Elixir
    const targetPath = url.pathname.replace('/proxy', '');
    const elixirUrl = `https://secure.elixirapp.nz${targetPath}${url.search}`;
    
    console.log(`Proxying ${request.method} ${targetPath} to Elixir`);
    
    // Clone and modify headers
    const headers = new Headers(request.headers);
    headers.set('Origin', 'https://secure.elixirapp.nz');
    headers.set('Host', 'secure.elixirapp.nz');
    headers.set('Referer', 'https://secure.elixirapp.nz/');
    
    // Forward the request
    const elixirRequest = new Request(elixirUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
    });
    
    try {
      const response = await fetch(elixirRequest);
      const data = await response.text();
      
      // Return with CORS headers
      return new Response(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': 'https://kraftinacos.github.io',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Encryption-Key, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://kraftinacos.github.io'
        }
      });
    }
  }
};