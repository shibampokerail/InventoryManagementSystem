import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware executed');

  // Check for Auth0 session cookie (appSession)
  const sessionCookie = await req.cookies.get('appSession')?.value || null;

  // If no session cookie, redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/(?!auth)|_next/static|_next/image|public|favicon.ico|login|api/auth).*)',
  ],
};