
// app/api/request-password-reset/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const YOUR_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL;
  const res = await fetch(`${YOUR_DOMAIN}/dbconnections/change_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      connection: 'Username-Password-Authentication',
    }),
  });

  if (res.ok) {
    return NextResponse.json({ message: 'Reset link sent' });
  } else {
    return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 });
  }
}
