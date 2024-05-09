export async function onRequestPost(context) {
	const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

    try {
		const fetchResponse = await fetch(`https://zamalek-eg.com/customApi/ZamalekEgNews.php`, settings);
		const data = await fetchResponse.json();
		let postData = JSON.stringify(data, null, 2);
		const database = await context.env.NORTHWIND_DB.prepare("UPDATE ZamalekEgNews SET fetchDB = ?1 WHERE id = ?2").bind( postData , 1 ).run()
		return new Response('Success parsing content');
    } catch (err) {
		return new Response('Error parsing content', { status: 400 });
    }
}