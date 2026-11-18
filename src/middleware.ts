import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin authorization check
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin?error=AccessDenied", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/checkout/:path*",
    "/trips/:path*",
    "/wallet/:path*",
    "/alerts/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
