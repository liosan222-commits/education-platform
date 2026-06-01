'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: roleParam === 'teacher' ? 'teacher' : 'student',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('تم التسجيل بنجاح');
        router.push('/login');
      } else {
        toast.error(data.message || 'خطأ في التسجيل');
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-96 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">التسجيل</h1>

        <input
          type="text"
          placeholder="الاسم الكامل"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />

        <input
          type="tel"
          placeholder="رقم الهاتف"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        >
          <option value="student">طالب</option>
          <option value="teacher">معلم</option>
        </select>

        <input
          type="password"
          placeholder="كلمة المرور"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />

        <input
          type="password"
          placeholder="تأكيد كلمة المرور"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 mb-6 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold transition disabled:opacity-50"
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>

        <p className="text-center mt-4 text-gray-400">
          لديك حساب بالفعل؟ <a href="/login" className="text-blue-500">دخول</a>
        </p>
      </div>
    </div>
  );
}
