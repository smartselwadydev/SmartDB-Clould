export async function onRequestGet(context) {
    const { request, env } = context;
    
    // Get URL from query parameter
    const url = new URL(request.url);
    const jsonUrl = url.searchParams.get('url');
    
    if (!jsonUrl) {
        return new Response(
            JSON.stringify({
                error: 'Missing URL parameter',
                usage: 'Add ?url=YOUR_JSON_URL to the request',
                example: `${url.origin}/?url=https://example.com/data.json`
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

    // Validate URL
    let targetUrl;
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

    const cache = caches.default;
    const cacheKey = new Request(targetUrl.toString(), request);
    
    // Check cache first
    let response = await cache.match(cacheKey);
    
    if (response) {
        console.log('Cache hit for:', targetUrl.toString());
        const headers = new Headers(response.headers);
        headers.set('X-Cache-Status', 'HIT');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(response.body, { ...response, headers });
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
                'Accept': 'application/json',
            },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            // Return the actual error status from the origin
            return new Response(
                JSON.stringify({
                    error: `Origin returned ${response.status}: ${response.statusText}`,
                    url: targetUrl.toString(),
                    status: response.status,
                    statusText: response.statusText,
                    timestamp: new Date().toISOString(),
                }),
                {
                    status: response.status, // Pass through the original status code
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }
        
        // Clone response to read body and cache separately
        const responseBody = await response.text();
        
        // Create new response with cache headers
        response = new Response(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers),
        });
        
        // Set caching headers
        response.headers.set('Cache-Control', 'public, max-age=300');
        response.headers.set('CDN-Cache-Control', 'public, max-age=300');
        response.headers.set('X-Cache-Status', 'MISS');
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('X-Requested-URL', targetUrl.toString());
        
        // Cache the response
        await cache.put(cacheKey, response.clone());
        
        return response;
        
    } catch (error) {
        console.error('Fetch error for', targetUrl.toString(), error);
        
        // Check if it's an abort error (timeout)
        if (error.name === 'AbortError') {
            return new Response(
                JSON.stringify({
                    error: 'Request timeout',
                    message: 'The origin server took too long to respond',
                    url: targetUrl.toString(),
                    timestamp: new Date().toISOString(),
                }),
                {
                    status: 504, // Gateway Timeout
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }
        
        // Try to return stale cache if available
        const staleResponse = await cache.match(cacheKey, { ignoreMethod: true });
        if (staleResponse) {
            console.log('Returning stale cache due to error');
            const headers = new Headers(staleResponse.headers);
            headers.set('X-Cache-Status', 'STALE');
            headers.set('Access-Control-Allow-Origin', '*');
            return new Response(staleResponse.body, { ...staleResponse, headers });
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