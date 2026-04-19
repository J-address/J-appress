import { NextRequest, NextResponse } from 'next/server';
import { Role, authResponseSchema } from '@j-address/shared';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: 'サーバーに接続できません' },
      { status: 503 },
    );
  }

  let data: unknown;
  try {
    data = await apiRes.json();
  } catch {
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 502 });
  }

  if (!apiRes.ok) {
    return NextResponse.json(data, { status: apiRes.status });
  }

  const result = authResponseSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json({ message: '予期しないレスポンス' }, { status: 502 });
  }

  const { access_token, user } = result.data;

  // Read variant from request body
  const variant = (body as Record<string, unknown>).variant as 'user' | 'admin' | undefined;

  if (variant === 'user' && user.role === Role.ADMIN) {
    return NextResponse.json(
      { message: '管理者は /admin/login からログインしてください' },
      { status: 403 },
    );
  }
  if (variant === 'admin' && user.role === Role.USER) {
    return NextResponse.json(
      { message: 'このページは管理者専用です' },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ user });

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour — matches NestJS JWT expiry
    path: '/',
  });

  return response;
}
