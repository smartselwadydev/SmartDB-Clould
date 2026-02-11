// functions/StartXtream.js or functions/StartXtream/index.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const ch = url.searchParams.get("ch");

  if (!ch) {
    return new Response("Missing 'ch' parameter", { status: 400 });
  }

    try {
		const fetchResponse = await fetch(`http://xtream1.beinconnect.us:25461/live/wegoal/wegoal/${ch}.m3u8`, settings);
		const data = await fetchResponse.json();
		return new Response('Success parsing content');
    } catch (err) {
		return new Response('Error parsing content', { status: 400 });
    }
}
