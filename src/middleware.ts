import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/?error=UnauthorizedAdminAccess", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/trips") ||
          pathname.startsWith("/products") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/rates") ||
          pathname.startsWith("/faq") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/terms") ||
          pathname.startsWith("/privacy")
        ) {
          return true;
        }

        // Protected customer and admin routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/custom-request/new",
  ],
};
