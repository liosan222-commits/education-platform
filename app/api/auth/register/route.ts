import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role } = await req.json();

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'البريد الإلكتروني مسجل بالفعل' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
          is_approved: role === 'teacher' ? false : true
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ message: 'خطأ في التسجيل' }, { status: 400 });
    }

    return NextResponse.json({ message: 'تم التسجيل بنجاح', user: newUser[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
