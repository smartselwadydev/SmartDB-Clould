// functions/StartXtream.js or functions/StartXtream/index.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const ch = url.searchParams.get("ch");

  if (!ch) {
    return new Response("Missing 'ch' parameter", { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Construct the URL
    const streamUrl = `http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${ch}.m3u8`;
    console.log(`Fetching: ${streamUrl}`); // Debug log
    
    const fetchResponse = await fetch(streamUrl);
    
    if (!fetchResponse.ok) {
      // Return more detailed error information
      return new Response(JSON.stringify({
        error: `Failed to fetch stream`,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        url: streamUrl,
        channel: ch
      }), { 
        status: fetchResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await fetchResponse.text();
    
    // Check if we got actual content (not empty)
    if (!data || data.trim().length === 0) {
      throw new Error('Empty response received');
    }
    
    return new Response(data, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Error parsing content',
      message: err.message,
      channel: ch
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}