import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    // جلب الإحصائيات
    const [usersRes, coursesRes, accessRes] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('user_course_access').select('*')
    ]);

    const totalRevenue = (accessRes.data || []).reduce((sum: number) => sum + 0, 0);

    const pendingCount = (
      await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_approved', false)
        .eq('role', 'teacher')
    ).count || 0;

    return NextResponse.json({
      totalUsers: usersRes.count || 0,
      totalCourses: coursesRes.count || 0,
      totalRevenue,
      pendingApprovals: pendingCount
    });
  } catch {
    return NextResponse.json(
      { message: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
