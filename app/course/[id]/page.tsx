'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecureVideoPlayer from '@/components/SecureVideoPlayer';
import toast from 'react-hot-toast';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  lesson_order: number;
}

interface CourseData {
  course: {
    id: string;
    title: string;
    description?: string;
  };
  lessons: Lesson[];
  expiresAt: string;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [data, setData] = useState<CourseData | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [userName, setUserName] = useState('');
  const userPhone = '';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseId}`);
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.message || 'فشل تحميل الدورة');
          router.push('/student');
          return;
        }

        setData(json);
        if (json.lessons?.length > 0) {
          setActiveLesson(json.lessons[0]);
        }

        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('session_token='))
          ?.split('=')[1];

        if (token) {
          const verifyRes = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.valid) {
            setUserName(verifyData.name || 'مستخدم');
          }
        }
      } catch {
        toast.error('حدث خطأ أثناء تحميل الدورة');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  return (
    <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">{data?.course.title || 'الدورة'}</h1>
            <Link href="/student" className="text-blue-400 hover:text-blue-300">
              العودة للوحة التحكم
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-8">
          {loading ? (
            <p className="text-center text-gray-400 py-12">جاري التحميل...</p>
          ) : !data ? (
            <p className="text-center text-gray-400 py-12">الدورة غير متاحة</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {activeLesson?.video_url ? (
                  <SecureVideoPlayer
                    videoUrl={activeLesson.video_url}
                    userName={userName}
                    userPhone={userPhone}
                    courseTitle={data.course.title}
                  />
                ) : (
                  <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400">
                    لا يوجد فيديو لهذا الدرس
                  </div>
                )}
                {activeLesson && (
                  <div className="mt-4">
                    <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                    {activeLesson.description && (
                      <p className="text-gray-400 mt-2">{activeLesson.description}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4">دروس الدورة</h3>
                <div className="space-y-2">
                  {data.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-right p-3 rounded-lg transition ${
                        activeLesson?.id === lesson.id
                          ? 'bg-blue-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}. {lesson.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
