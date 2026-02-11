export async function onRequest(context) {
  try {
    const { request } = context;
    
    // Get URL from query parameter
    const url = new URL(request.url);
    const channelId = url.searchParams.get('ch');

    // Validate channel ID
    if (!channelId) {
      return new Response(
        JSON.stringify({
          error: 'Missing parameter',
          message: 'Channel ID (ch) is required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Construct the target URL
    const targetUrl = `http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${channelId}.m3u8`;

    // Try to get from cache
    const cache = caches.default;
    const cacheKey = new Request(targetUrl, request);
    let response = await cache.match(cacheKey);

    if (!response) {
      // Fetch from origin
      response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
      });

      if (!response.ok) {
        throw new Error(`Origin responded with status: ${response.status}`);
      }

      // Clone response for caching
      const responseToCache = response.clone();
      
      // Cache for 1 hour
      context.waitUntil(cache.put(cacheKey, responseToCache));
    }

    // Create new response with CORS headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
    newHeaders.set('Cache-Control', 'public, max-age=3600');
    
    // For M3U8 files, ensure correct content type
    if (!newHeaders.has('Content-Type')) {
      newHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error.message || 'An error occurred while proxying the request'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}