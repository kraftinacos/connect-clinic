// Cloudflare Pages Function - API Proxy
// File: functions/api/[[path]].js
// This proxies all /api/* requests to Elixir with CORS headers

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Encryption-Key, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // Build target URL - forward everything after /api/ to Elixir
  const targetPath = url.pathname.replace('/api', '');
  const elixirUrl = `https://secure.elixirapp.nz${targetPath}${url.search}`;
  
  console.log(`Proxying ${request.method} ${targetPath} to Elixir`);
  
  // Clone headers and modify for Elixir
  const headers = new Headers(request.headers);
  headers.set('Origin', 'https://secure.elixirapp.nz');
  headers.set('Host', 'secure.elixirapp.nz');
  headers.set('Referer', 'https://secure.elixirapp.nz/');
  
  try {
    // Forward request to Elixir
    const elixirResponse = await fetch(elixirUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
    });
    
    // Clone response and add CORS headers
    const responseHeaders = new Headers(elixirResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Encryption-Key');
    
    return new Response(elixirResponse.body, {
      status: elixirResponse.status,
      statusText: elixirResponse.statusText,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error.message,
      url: elixirUrl 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}