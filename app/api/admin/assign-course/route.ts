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

    // التحقق من أن المستخدم مدير
    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', decoded.id)
      .single();

    if (admin?.role !== 'super_admin') {
      return NextResponse.json(
        { message: 'ليس لديك صلاحية' },
        { status: 403 }
      );
    }

    const { userId, courseId, expiresInDays = 180 } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { message: 'يجب تحديد معرف الطالب والمادة' },
        { status: 400 }
      );
    }

    // حساب تاريخ انتهاء الصلاحية
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // التحقق من عدم وجود حق وصول سابق
    const { data: existing } = await supabaseAdmin
      .from('user_course_access')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      // تحديث الصلاحية الموجودة
      const { error } = await supabaseAdmin
        .from('user_course_access')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
    } else {
      // إنشاء حق وصول جديد
      const { error } = await supabaseAdmin
        .from('user_course_access')
        .insert({
          user_id: userId,
          course_id: courseId,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'تم تعيين المادة بنجاح',
        expiresAt: expiresAt.toISOString()
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
