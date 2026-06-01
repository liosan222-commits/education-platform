import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // التحقق من الجلسة الحالية
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (userError || !user || user.current_session_token !== token) {
      return NextResponse.json(
        { message: 'تم تسجيل الدخول من جهاز آخر' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية المستخدم في الدورة
    const { data: access, error: accessError } = await supabase
      .from('user_course_access')
      .select('*')
      .eq('user_id', decoded.id)
      .eq('course_id', id)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { message: 'غير مصرح بالوصول لهذه الدورة' },
        { status: 403 }
      );
    }

    // جلب تفاصيل الدورة
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { message: 'الدورة غير موجودة' },
        { status: 404 }
      );
    }

    // جلب دروس الدورة
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('lesson_order', { ascending: true });

    const { password, ...safeUser } = user;
    void password;

    return NextResponse.json({
      course,
      user: safeUser,
      lessons: lessons || [],
      userAccess: access,
      expiresAt: access.expires_at,
    });
  } catch {
    return NextResponse.json(
      { message: 'توكن غير صالح' },
      { status: 401 }
    );
  }
}
