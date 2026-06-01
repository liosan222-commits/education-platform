'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  expires_at: string;
  purchased_at: string;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/my-courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      toast.error('فشل تحميل الدورات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch courses on mount
    void fetchMyCourses();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('تم تسجيل الخروج');
        router.push('/login');
      }
    } catch {
      toast.error('خطأ في تسجيل الخروج');
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">لوحة الطالب</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              تسجيل خروج
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">مرحباً بك في منصتك التعليمية</h2>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-600 p-6 rounded-lg shadow-lg">
              <p className="text-gray-200 text-sm">الدورات المشتراة</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
            <div className="bg-green-600 p-6 rounded-lg shadow-lg">
              <p className="text-gray-200 text-sm">نشطة الآن</p>
              <p className="text-3xl font-bold">
                {courses.filter(c => getDaysRemaining(c.expires_at) > 0).length}
              </p>
            </div>
            <div className="bg-yellow-600 p-6 rounded-lg shadow-lg">
              <p className="text-gray-200 text-sm">قريبة من الانتهاء</p>
              <p className="text-3xl font-bold">
                {courses.filter(c => getDaysRemaining(c.expires_at) <= 30 && getDaysRemaining(c.expires_at) > 0).length}
              </p>
            </div>
            <div className="bg-red-600 p-6 rounded-lg shadow-lg">
              <p className="text-gray-200 text-sm">منتهية الصلاحية</p>
              <p className="text-3xl font-bold">
                {courses.filter(c => getDaysRemaining(c.expires_at) <= 0).length}
              </p>
            </div>
          </div>

          {/* Courses Section */}
          <h3 className="text-2xl font-bold mb-6">دوراتي</h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">جاري التحميل...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">لا توجد دورات مشتراة</p>
              <Link href="/" className="text-blue-500 hover:text-blue-400">
                عودة للرئيسية
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const daysRemaining = getDaysRemaining(course.expires_at);
                const isExpired = daysRemaining <= 0;
                const isExpiringSoon = daysRemaining <= 30 && !isExpired;

                return (
                  <div
                    key={course.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
                  >
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{course.title}</h4>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description || 'لا توجد وصف'}
                      </p>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">
                          اشتري بتاريخ: {new Date(course.purchased_at).toLocaleDateString('ar-EG')}
                        </p>

                        {isExpired ? (
                          <div className="bg-red-900 text-red-200 px-3 py-2 rounded text-sm text-center">
                            منتهية الصلاحية
                          </div>
                        ) : isExpiringSoon ? (
                          <div className="bg-yellow-900 text-yellow-200 px-3 py-2 rounded text-sm text-center">
                            تنتهي خلال {daysRemaining} أيام
                          </div>
                        ) : (
                          <div className="bg-green-900 text-green-200 px-3 py-2 rounded text-sm text-center">
                            متبقي {daysRemaining} يوم
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/course/${course.id}`}
                        className={`block w-full text-center py-2 rounded font-bold transition ${
                          isExpired
                            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        onClick={e => isExpired && e.preventDefault()}
                      >
                        {isExpired ? 'انتهت الصلاحية' : 'ادخل الدورة'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
