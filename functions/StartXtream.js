// functions/StartXtream.js or functions/StartXtream/index.js
export async function onRequest(context) {
  const { request, env, ctx } = context;
  const url = new URL(request.url);
  
  // Get URL from query parameter (supports both 'ch' and 'url' parameters)
  const ch = url.searchParams.get("ch");
  const jsonUrl = url.searchParams.get("url");
  
  // Determine the target URL
  let targetUrl;
  
  if (jsonUrl) {
    // Direct URL provided
    try {
      targetUrl = new URL(jsonUrl);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid URL',
          message: 'The provided URL is not valid'
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
  } else if (ch) {
    // Build Xtream URL from channel parameter
    targetUrl = new URL(`http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${ch}.m3u8`);
  } else {
    return new Response(
      JSON.stringify({
        error: 'Missing parameter',
        message: 'Provide either ?url= or ?ch= parameter',
        usage: 'Add ?url=YOUR_STREAM_URL or ?ch=CHANNEL_NUMBER to the request',
        example: `${url.origin}/?url=http://example.com/stream.m3u8 or ${url.origin}/?ch=123`
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

  // Use cache if available
  const cache = caches.default;
  const cacheKey = new Request(targetUrl.toString(), request);
  
  // Check cache first
  let response = await cache.match(cacheKey);
  
  if (response) {
    console.log('Cache hit for:', targetUrl.toString());
    const headers = new Headers(response.headers);
    headers.set('X-Cache-Status', 'HIT');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { 
      status: response.status,
      statusText: response.statusText,
      headers 
    });
  }
  
  console.log('Cache miss - fetching from origin:', targetUrl.toString());
  
  try {
    // Fetch from origin with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Cloudflare-Worker',
        'Accept': '*/*',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Get content type from response
    const contentType = response.headers.get('Content-Type') || 'application/vnd.apple.mpegurl';
    
    // Clone response to read body and cache separately
    const responseBody = await response.text();
    
    // Create new response with cache headers
    response = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300',
        'CDN-Cache-Control': 'public, max-age=300',
        'X-Cache-Status': 'MISS',
        'Access-Control-Allow-Origin': '*',
        'X-Requested-URL': targetUrl.toString(),
      },
    });
    
    // Cache the response if ctx is available
    if (ctx && ctx.waitUntil) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } else {
      // Fallback for environments without ctx.waitUntil
      await cache.put(cacheKey, response.clone());
    }
    
    return response;
    
  } catch (error) {
    console.error('Fetch error for', targetUrl.toString(), error);
    
    // Try to return stale cache if available
    const staleResponse = await cache.match(cacheKey, { ignoreMethod: true });
    if (staleResponse) {
      console.log('Returning stale cache due to error');
      const headers = new Headers(staleResponse.headers);
      headers.set('X-Cache-Status', 'STALE');
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(staleResponse.body, { 
        status: staleResponse.status,
        statusText: staleResponse.statusText,
        headers 
      });
    }
    
    return new Response(
      JSON.stringify({
        error: 'Service unavailable',
        message: error.message,
        url: targetUrl.toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}