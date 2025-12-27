const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const origin = req.headers.get('Origin') || '*';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
    
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    const url = new URL(req.url);
    console.log(`Req: ${req.method} ${url.pathname}`);

    if (url.pathname === '/auth/check') {
         // Return valid user
         return new Response(JSON.stringify({
             id: '1',
             username: 'testuser',
             active: true,
             avatarUrl: 'https://placehold.co/100'
         }), { headers });
    }

    if (url.pathname.endsWith('/graphql') && req.method === 'POST') {
        const body = await req.json();
        const op = body.operationName;
        console.log(`Mocking GQL Op: ${op}`);
        
        if (op === 'GetRoles') {
             return new Response(JSON.stringify({
                data: {
                    roles: [
                        { id: 1, name: 'admin', displayName: 'Mock Admin', hierarchy: 1, description: 'Mock', isRestricted: false, isActive: true },
                        { id: 2, name: 'player', displayName: 'Mock Player', hierarchy: 10, description: 'Mock', isRestricted: false, isActive: true }
                    ]
                }
            }), { headers });
        }
        
        return new Response(JSON.stringify({ data: {} }), { headers });
    }
    return new Response("Not Found", { status: 404, headers });
  },
});
console.log(`Mock GraphQL Server listening on localhost:${server.port}`);
