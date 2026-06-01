'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/pending-users')
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setPendingUsers(usersData.users || []);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch dashboard data on mount
    void fetchDashboardData();
  }, []);

  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        toast.success('تم الموافقة على الحساب');
        fetchDashboardData();
      } else {
        toast.error('فشل الموافقة');
      }
    } catch {
      toast.error('خطأ في الخادم');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        toast.success('تم رفض الحساب');
        fetchDashboardData();
      } else {
        toast.error('فشل الرفض');
      }
    } catch {
      toast.error('خطأ في الخادم');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      toast.error('خطأ في تسجيل الخروج');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              تسجيل خروج
            </button>
          </div>
        </nav>

        <div className="p-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">لوحة التحكم</h2>

          {/* Statistics */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-600 p-6 rounded-lg shadow-lg">
                <p className="text-gray-200 text-sm">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-green-600 p-6 rounded-lg shadow-lg">
                <p className="text-gray-200 text-sm">إجمالي الدورات</p>
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
              </div>
              <div className="bg-yellow-600 p-6 rounded-lg shadow-lg">
                <p className="text-gray-200 text-sm">الإيرادات الكلية</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-red-600 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-red-700">
                <p className="text-gray-200 text-sm">في انتظار الموافقة</p>
                <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          <h3 className="text-2xl font-bold mb-6">الموافقات المعلقة</h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">جاري التحميل...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
              <p className="text-gray-400">لا توجد موافقات معلقة</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right">الاسم</th>
                      <th className="px-6 py-3 text-right">البريد</th>
                      <th className="px-6 py-3 text-right">النوع</th>
                      <th className="px-6 py-3 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">
                            {user.role === 'teacher' ? 'معلم' : 'طالب'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                          >
                            رفض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Tools */}
          <h3 className="text-2xl font-bold mb-6">أدوات الإدارة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4">إدارة المستخدمين</h4>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold">
                  عرض جميع المستخدمين
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold">
                  إعادة تعيين كلمات المرور
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4">إدارة الدورات</h4>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold">
                  عرض جميع الدورات
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold">
                  حذف دورات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
