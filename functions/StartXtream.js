// functions/StartXtream.js or functions/StartXtream/index.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const ch = url.searchParams.get("ch");

  if (!ch) {
    return new Response("Missing 'ch' parameter", { status: 400 });
  }

  try {
    const response = await fetch(
      `http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${ch}.m3u8`
    );
    
    const m3u8Content = await response.text();
    
    return new Response(m3u8Content, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (error) {
    return new Response(`Error fetching stream: ${error.message}`, { 
      status: 500 
    });
  }
}