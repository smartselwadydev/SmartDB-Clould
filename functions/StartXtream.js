// functions/StartXtream.js or functions/StartXtream/index.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const ch = url.searchParams.get("ch");

  if (!ch) {
    return new Response("Missing 'ch' parameter", { status: 400 });
  }

  try {
    // Fix 1: 'settings' is not defined - use an empty object or remove it
    // Fix 2: The endpoint returns m3u8, not JSON - don't use .json()
    const fetchResponse = await fetch(`http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${ch}.m3u8`);
    
    // Fix 3: Check if response is OK before proceeding
    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }
    
    // Fix 4: Get the response as text (since it's m3u8), not JSON
    const data = await fetchResponse.text();
    
    // Fix 5: Return the actual m3u8 content with correct content-type
    return new Response(data, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*' // Add CORS if needed
      }
    });
    
  } catch (err) {
    // Fix 6: Include error details in response
    return new Response(`Error parsing content: ${err.message}`, { 
      status: 500 // Use 500 for server errors, not 400
    });
  }
}