export async function onRequest(context) {
  const corsHeaders = {
	  'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
  }
  const results = context.env.NORTHWIND_DB.prepare('SELECT * from LiveStreamCh WHERE id = ?').bind( 1 );
  const data = await results.all();
  return Response(data.results[0].fetchDB, {
      headers: corsHeaders
  });
}