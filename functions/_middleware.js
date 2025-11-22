export async function onRequest(context) {
  const { request, next } = context;

  const allowedOrigins = [
    'adidizdarevic.com',
    'www.adidizdarevic.com',
  ];

  const referer = request.headers.get('Referer') || '';
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);

  const isAllowed = allowedOrigins.some(domain =>
    referer.includes(domain) || origin.includes(domain)
  );

  // Allow localhost for development
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (!isAllowed && !isDev) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AD&</title>
        <style>
          body {
            background: #0a0a0a;
            color: #fff;
            font-family: -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          a { color: #007AFF; }
        </style>
      </head>
      <body>
        <p>Visit <a href="https://adidizdarevic.com">adidizdarevic.com</a> to view this experiment</p>
      </body>
      </html>
    `, {
      status: 403,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const response = await next();
  const newResponse = new Response(response.body, response);

  // Prevent embedding on other sites
  newResponse.headers.set('Content-Security-Policy',
    "frame-ancestors 'self' https://adidizdarevic.com https://www.adidizdarevic.com");

  return newResponse;
}
