import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'your_jwt_secret_key',
);

type JwtPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

async function getPayload(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;
  const payload = token ? await getPayload(token) : null;

  // /inbox/* — require authenticated USER
  if (pathname.startsWith('/inbox')) {
    if (!payload || payload.role !== 'USER') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // /admin/login — redirect ADMIN away if already authenticated
  if (pathname === '/admin/login') {
    if (payload?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // /admin/* — require authenticated ADMIN
  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // /login — redirect USER away if already authenticated
  if (pathname === '/login') {
    if (payload?.role === 'USER') {
      return NextResponse.redirect(new URL('/inbox', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// If the path matches one of these, the middleware checks the token
export const config = {
  matcher: ['/inbox', '/inbox/:path*', '/admin', '/admin/:path*', '/login'],
};
