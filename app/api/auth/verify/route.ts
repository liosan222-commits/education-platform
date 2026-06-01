import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const decoded = verifyToken(token);
    return NextResponse.json({
      valid: true,
      role: decoded.role,
      id: decoded.id,
      name: decoded.name,
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
