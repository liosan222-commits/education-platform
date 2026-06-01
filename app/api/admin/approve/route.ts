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

    // موافقة على الحساب
    const { userId } = await req.json();

    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'تم تفعيل الحساب بنجاح' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
