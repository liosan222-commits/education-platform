'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description?: string;
  lessons?: { id: string }[];
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/my-courses');
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

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="p-8 bg-gray-950 min-h-screen text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">لوحة تحكم الأستاذ</h1>

          <div className="mb-8">
            <Link
              href="/teacher/upload"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-bold inline-block transition"
            >
              رفع درس جديد
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-400">جاري التحميل...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-400">لم تنشئ أي مواد بعد</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-gray-900 p-6 rounded-2xl">
                  <h2 className="text-2xl font-bold">{course.title}</h2>
                  <p className="text-gray-400 mt-2">
                    عدد الدروس: {course.lessons?.length ?? 0}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">ID: {course.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
