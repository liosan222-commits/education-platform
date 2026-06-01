import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session_token')?.value;

    if (token) {
      try {
        const decoded = verifyToken(token);

        // حذف التوكن من قاعدة البيانات
        await supabaseAdmin
          .from('users')
          .update({ current_session_token: null })
          .eq('id', decoded.id);
      } catch {
        // التوكن قد يكون منتهي الصلاحية بالفعل
      }
    }

    // إنشاء الاستجابة مع حذف الكوكي
    const response = NextResponse.json(
      { message: 'تم تسجيل الخروج بنجاح' },
      { status: 200 }
    );

    response.cookies.delete('session_token');

    return response;
  } catch {
    return NextResponse.json(
      { message: 'خطأ في تسجيل الخروج' },
      { status: 500 }
    );
  }
}
