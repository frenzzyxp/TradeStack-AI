import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/inbox")) {
    const pass = process.env.INBOX_PASSWORD;
    const sent = req.headers.get("x-inbox-password");
    if (!pass || sent !== pass) return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/inbox/:path*"] };
