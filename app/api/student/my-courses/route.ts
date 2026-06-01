import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // جلب الدورات التي يمتلك الطالب صلاحية الوصول إليها
    const { data: accessList, error: accessError } = await supabase
      .from('user_course_access')
      .select('course_id, expires_at, purchased_at')
      .eq('user_id', decoded.id)
      .gt('expires_at', new Date().toISOString());

    if (accessError) {
      return NextResponse.json(
        { message: accessError.message },
        { status: 400 }
      );
    }

    if (!accessList || accessList.length === 0) {
      return NextResponse.json(
        { courses: [] },
        { status: 200 }
      );
    }

    // جلب تفاصيل الدورات
    const courseIds = accessList.map(a => a.course_id);
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail, is_active')
      .in('id', courseIds)
      .eq('is_active', true);

    if (coursesError) {
      return NextResponse.json(
        { message: coursesError.message },
        { status: 400 }
      );
    }

    // دمج معلومات الوصول مع الدورات
    const enrichedCourses = courses?.map(course => {
      const access = accessList.find(a => a.course_id === course.id);
      return {
        ...course,
        expires_at: access?.expires_at,
        purchased_at: access?.purchased_at
      };
    }) || [];

    return NextResponse.json(
      { courses: enrichedCourses },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
