export async function onRequest(context) {
  const corsHeaders = {
	  'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
  }
  const results = context.env.NORTHWIND_DB.prepare('SELECT * from LiveStreamMatchs WHERE id = ?').bind( 1 );
  const data = await results.all();
  return Response.json(data, {
      headers: corsHeaders
  });
}