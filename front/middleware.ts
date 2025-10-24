import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/forbidden"];
const authRoutes = ["/auth"];
const privateRoutes = ["/dashboard", "/profile", "/settings"];

// Role-based route protection
const roleRoutes: Record<string, string[]> = {
  admin: ["/dashboard/users"],
  moderator: ["/moderation"],
  editor: ["/editor"],
};

function matchRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; user?: { id: string; username: string; role: string } }> {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) return { authenticated: false };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return { authenticated: false };

    const data = await res.json();
    if (data.valid && data.user) {
      return { authenticated: true, user: data.user };
    }

    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow home page
  if (matchRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  const { authenticated, user } = await verifyAuth(request);

  // Redirect authenticated users away from auth pages
  if (matchRoute(pathname, authRoutes)) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check role-based routes
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (matchRoute(pathname, routes)) {
      if (!authenticated) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
      if (user?.role !== role) {
        // User doesn't have required role - redirect to forbidden page
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
      return NextResponse.next();
    }
  }

  // Protect general private routes
  if (matchRoute(pathname, privateRoutes)) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|_next/data).*)"],
};
