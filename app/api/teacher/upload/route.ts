import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { data: teacher } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', decoded.id)
      .single();

    if (teacher?.role !== 'teacher') {
      return NextResponse.json({ message: 'ليس لديك صلاحية' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const courseId = formData.get('courseId') as string;
    const video = formData.get('video') as File | null;
    const pdf = formData.get('pdf') as File | null;

    if (!title?.trim() || !courseId) {
      return NextResponse.json({ message: 'العنوان ومعرف المادة مطلوبان' }, { status: 400 });
    }

    if (!video || video.size === 0) {
      return NextResponse.json({ message: 'يجب رفع فيديو' }, { status: 400 });
    }

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', decoded.id)
      .single();

    if (!course) {
      return NextResponse.json({ message: 'المادة غير موجودة أو لا تملك صلاحية' }, { status: 403 });
    }

    const videoPath = `videos/${Date.now()}-${video.name}`;
    const { error: videoError } = await supabaseAdmin.storage
      .from('course-content')
      .upload(videoPath, video);

    if (videoError) {
      return NextResponse.json({ message: videoError.message }, { status: 400 });
    }

    const { data: videoUrlData } = supabaseAdmin.storage
      .from('course-content')
      .getPublicUrl(videoPath);

    let pdfUrl: string | null = null;
    if (pdf && pdf.size > 0) {
      const pdfPath = `pdfs/${Date.now()}-${pdf.name}`;
      const { error: pdfError } = await supabaseAdmin.storage
        .from('course-content')
        .upload(pdfPath, pdf);

      if (pdfError) {
        return NextResponse.json({ message: pdfError.message }, { status: 400 });
      }

      const { data: pdfUrlData } = supabaseAdmin.storage
        .from('course-content')
        .getPublicUrl(pdfPath);
      pdfUrl = pdfUrlData.publicUrl;
    }

    const { data: existingLessons } = await supabaseAdmin
      .from('lessons')
      .select('lesson_order')
      .eq('course_id', courseId)
      .order('lesson_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingLessons?.[0]?.lesson_order ?? 0) + 1;

    const description = pdfUrl ? `PDF: ${pdfUrl}` : null;

    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .insert({
        course_id: courseId,
        title: title.trim(),
        description,
        video_url: videoUrlData.publicUrl,
        lesson_order: nextOrder,
      })
      .select()
      .single();

    if (lessonError) {
      return NextResponse.json({ message: lessonError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'تم الرفع بنجاح',
      videoUrl: videoUrlData.publicUrl,
      pdfUrl,
      lesson,
    });
  } catch {
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
