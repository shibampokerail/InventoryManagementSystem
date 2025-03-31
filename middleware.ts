<<<<<<< Updated upstream
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Example: Redirect unauthenticated users
  if (req.cookies.has("token")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
=======
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Example middleware logic
  console.log('Middleware executed');
  return NextResponse.next();
}
>>>>>>> Stashed changes
