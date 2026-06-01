import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">403</h1>
        <p className="text-xl text-gray-400 mb-6">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-block">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
