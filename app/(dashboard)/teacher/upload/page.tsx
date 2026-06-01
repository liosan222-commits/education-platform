'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim() || !courseId.trim()) {
      toast.error('أدخل عنوان الدرس ومعرف المادة');
      return;
    }
    if (!videoFile) {
      toast.error('يجب رفع فيديو');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('courseId', courseId);
      formData.append('video', videoFile);
      if (pdfFile) formData.append('pdf', pdfFile);

      const res = await fetch('/api/teacher/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('تم رفع الدرس بنجاح');
        setTitle('');
        setCourseId('');
        setVideoFile(null);
        setPdfFile(null);
      } else {
        toast.error(data.message || 'فشل الرفع');
      }
    } catch {
      toast.error('حدث خطأ أثناء الرفع');
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/teacher" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
            ← العودة للوحة التحكم
          </Link>

          <div className="bg-gray-900 rounded-3xl p-8">
            <h1 className="text-3xl font-bold mb-8">رفع درس جديد</h1>

            <input
              type="text"
              placeholder="عنوان الدرس"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="معرف المادة (Course ID)"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mb-6">
              <p className="mb-2 text-gray-300">الفيديو (موصى به HLS)</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="w-full text-gray-300"
              />
            </div>

            <div className="mb-8">
              <p className="mb-2 text-gray-300">ملف PDF (اختياري)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="w-full text-gray-300"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-green-600 py-4 rounded-xl text-xl font-bold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'جاري الرفع...' : 'رفع المحتوى'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
