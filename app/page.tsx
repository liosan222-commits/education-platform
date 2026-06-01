export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">منصة التعليم الإلكترونية</h1>
          <div className="space-x-4">
            <a href="/login" className="hover:text-blue-400">دخول</a>
            <a href="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">تسجيل</a>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto p-8 text-center py-20">
        <h2 className="text-5xl font-bold mb-4">منصة التعليم الإلكترونية الآمنة</h2>
        <p className="text-xl text-gray-400 mb-8">
          نظام متكامل لإدارة الدورات التعليمية مع حماية محتوى الفيديو بالعلامات المائية
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-2">للطلاب</h3>
            <p className="text-gray-400">استعرض واشترك في آلاف الدورات التعليمية</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2">للمعلمين</h3>
            <p className="text-gray-400">أنشئ وأدر دوراتك التعليمية بكل سهولة</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-2">الأمان</h3>
            <p className="text-gray-400">محتوى محمي بالعلامات المائية والتشفير</p>
          </div>
        </div>

        <div className="space-x-4">
          <a href="/register?role=student" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg inline-block font-bold">
            إنشاء حساب طالب
          </a>
          <a href="/register?role=teacher" className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg inline-block font-bold">
            إنشاء حساب معلم
          </a>
        </div>
      </section>
    </main>
  );
}
