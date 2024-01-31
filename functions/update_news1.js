export async function onRequestPost(context) {
	const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

  try {
    const fetchResponse = await fetch(`https://panel.smartselwady.com/YallaGoal/updatenews1.php`, settings);
    const data = await fetchResponse.json();
	let postData = JSON.stringify(data, null, 2);
	const database = await context.env.NORTHWIND_DB.prepare("UPDATE News SET data_1 = ?1 WHERE id = ?2").bind( postData , 1 ).run()
	return new Response(postData, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
  } catch (err) {
    return new Response('Error parsing content', { status: 400 });
  }
}