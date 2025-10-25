// proxy.ts (Next.js 16+)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Either a *default export* OR a named `proxy` export is required.
// We'll use a default export here.
export default function proxy(req: NextRequest) {
  // Simple protection for /inbox using a header password
  if (req.nextUrl.pathname.startsWith("/inbox")) {
    const pass = process.env.INBOX_PASSWORD;
    const sent = req.headers.get("x-inbox-password");
    if (!pass || sent !== pass) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  return NextResponse.next();
}

// Limit interception to just /inbox
export const config = {
  matcher: ["/inbox/:path*"],
};
