import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'بيانات خاطئة' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    if (user.role === 'student' && !user.is_approved) {
      return NextResponse.json({ message: 'حسابك في انتظار التفعيل من الإدارة' }, { status: 403 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    await supabaseAdmin
      .from('users')
      .update({ current_session_token: token })
      .eq('id', user.id);

    return NextResponse.json({ token, role: user.role, name: user.name });
  } catch {
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
