import { NextRequest, NextResponse } from 'next/server';

export function handleCors(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin') || '*';
  const response = new NextResponse(null, { status: 204 });

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return response; // 🔁 return immediately for preflight
  }

  return null; // ✅ continue processing
}
