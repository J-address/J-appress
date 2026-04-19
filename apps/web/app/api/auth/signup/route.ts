import { Role } from '@j-address/shared';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiUrl}/auth/signup`, {
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

  const payload = data as Record<string, unknown>;
  if (typeof payload.access_token !== 'string' || !payload.user) {
    return NextResponse.json({ message: '予期しないレスポンス' }, { status: 502 });
  }

  const { access_token, user } = payload as { access_token: string; user: { id: string; email: string; role: Role } };

  const response = NextResponse.json({ user });

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  });

  return response;
}
