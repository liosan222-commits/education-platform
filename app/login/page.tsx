'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok) {
        document.cookie = `session_token=${data.token}; path=/; max-age=86400`;
        toast.success('تم تسجيل الدخول بنجاح');
        router.push(
          data.role === 'super_admin' ? '/admin' :
          data.role === 'teacher' ? '/teacher' : '/student'
        );
      } else {
        toast.error(data.message || 'خطأ في تسجيل الدخول');
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-96 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">تسجيل الدخول</h1>
        
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        
        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full p-3 mb-6 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-bold transition disabled:opacity-50"
        >
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>
        
        <p className="text-center mt-4 text-gray-400">
          ليس لديك حساب؟ <a href="/register" className="text-blue-500">سجل الآن</a>
        </p>
      </div>
    </div>
  );
}
