
export async function onRequest(context) {
  const corsHeaders = {
	  'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      //'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
  }
  //const info = await context.env.NORTHWIND_DB.prepare('INSERT INTO test (title1, title2) VALUES (?1, ?2)').bind( "John", "smart" ).run()

  const results = context.env.NORTHWIND_DB.prepare('SELECT * from Channels WHERE status = ? ORDER BY veiw_order ASC').bind( 1 );
  const data = await results.all();
  return Response.json(data, {
      headers: corsHeaders
  });
}