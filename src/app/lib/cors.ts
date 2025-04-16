import { NextRequest, NextResponse } from 'next/server';

export function cors(req: NextRequest, res: NextResponse, next: () => void) {
  const origin = req.headers.get('origin') || '*';

  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');

  // If it's a preflight request, return 200 immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: res.headers,
    });
  }

  next();
}
