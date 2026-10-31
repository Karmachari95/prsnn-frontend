import { NextResponse } from 'next/server';

const TARGET_BACKEND = process.env.BACKEND_PROXY_URL || 'https://prssn-backend.onrender.com';

async function proxyHandler(request, context) {
  try {
    const params = await context.params;
    const pathParts = params?.path || [];
    const pathname = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;
    const search = request.nextUrl.search || '';
    const targetUrl = `${TARGET_BACKEND}/api/${pathname}${search}`;

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Drop hop-by-hop and host headers
      if (!['host', 'connection', 'content-length', 'content-encoding'].includes(lowerKey)) {
        forwardHeaders.set(key, value);
      }
    });

    // Send allowed origin and host for backend CORS compliance
    forwardHeaders.set('origin', 'http://localhost:3000');
    forwardHeaders.set('host', new URL(TARGET_BACKEND).host);

    const init = {
      method: request.method,
      headers: forwardHeaders,
    };

    if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
      const arrayBuffer = await request.arrayBuffer();
      if (arrayBuffer.byteLength > 0) {
        init.body = Buffer.from(arrayBuffer);
      }
    }

    const res = await fetch(targetUrl, init);

    const resHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
        resHeaders.set(key, value);
      }
    });

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { message: 'API service unavailable. Please try again.', error: error.message },
      { status: 502 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
export const OPTIONS = proxyHandler;
