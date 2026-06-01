import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    const { title, description, price } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: 'عنوان الدورة مطلوب' },
        { status: 400 }
      );
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title: title.trim(),
        description: description || null,
        price: price || 0,
        teacher_id: decoded.id,
        is_active: true
      })
      .select();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'تم إنشاء الدورة بنجاح', course: course?.[0] },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
