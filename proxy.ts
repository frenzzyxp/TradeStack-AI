// proxy.ts (Next.js 16+)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  // Only guard /inbox paths
  if (req.nextUrl.pathname.startsWith("/inbox")) {
    const cookie = req.cookies.get("ts_inbox_auth")?.value; // set after login
    const pass = process.env.INBOX_PASSWORD;

    // If not logged in, send to /login
    if (!cookie || !pass || cookie !== pass) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/inbox/:path*"] };
