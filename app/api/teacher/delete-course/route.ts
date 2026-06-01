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

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { message: 'معرف الدورة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من ملكية الدورة
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('teacher_id')
      .eq('id', courseId)
      .single();

    if (!course || course.teacher_id !== decoded.id) {
      return NextResponse.json(
        { message: 'لا تملك صلاحية حذف هذه الدورة' },
        { status: 403 }
      );
    }

    // حذف الدورة
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'تم حذف الدورة بنجاح' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
