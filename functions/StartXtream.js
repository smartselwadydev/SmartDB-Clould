export default {
  async fetch(request, env, ctx) {
    try {
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
            },
          }
        );
      }

      // Construct the target URL
      const targetUrl = new URL(`http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${channelId}.m3u8`);

      // Try to get from cache
      const cache = caches.default;
      const cacheKey = new Request(targetUrl.toString(), request);
      let response = await cache.match(cacheKey);

      if (!response) {
        // Fetch from origin
        response = await fetch(targetUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Origin responded with status: ${response.status}`);
        }

        // Clone response for caching
        const responseToCache = response.clone();
        
        // Cache for 1 hour
        ctx.waitUntil(cache.put(cacheKey, responseToCache));
      }

      // Return the response with CORS headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Cache-Control', 'public, max-age=3600');
      
      return newResponse;

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
          },
        }
      );
    }
  }
};