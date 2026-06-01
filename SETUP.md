# منصة التعليم الإلكترونية - Education Platform

نظام متكامل لإدارة الدورات التعليمية مع حماية محتوى الفيديو بالعلامات المائية والتشفير.

## ✅ ما تم إنشاؤه

### المجلدات:
```
education-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         ✓ صفحة تسجيل الدخول
│   │   └── register/page.tsx      ✓ صفحة التسجيل
│   ├── (dashboard)/
│   │   ├── admin/page.tsx         ✓ لوحة تحكم المدير
│   │   ├── teacher/page.tsx       ✓ لوحة تحكم المعلم
│   │   └── student/page.tsx       ✓ لوحة تحكم الطالب
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts     ✓ API تسجيل الدخول
│   │       ├── register/route.ts  ✓ API التسجيل
│   │       └── verify/route.ts    ✓ API التحقق من التوكن
│   ├── course/[id]/               ✓ صفحة الدورة الفردية
│   ├── page.tsx                   ✓ الصفحة الرئيسية
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── Watermark.tsx              ✓ مكون العلامة المائية
│   ├── ProtectedRoute.tsx          ✓ مكون الحماية
│   ├── ChatInput.tsx
│   ├── SettingsModal.tsx
│   └── SecureVideoPlayer.tsx       ✓ مشغل الفيديو الآمن
├── lib/
│   └── supabase.ts                ✓ إعدادات Supabase
├── types/
│   └── index.ts                   ✓ TypeScript Types
├── supabase/
│   └── migrations/
├── middleware.ts                  ✓ Middleware للحماية
├── .env.local                     ✓ متغيرات البيئة (template)
├── tailwind.config.ts             ✓ إعدادات Tailwind
├── tsconfig.json
├── package.json                   ✓ مع الحزم المطلوبة
└── README.md
```

## 🚀 خطوات الإعداد

### 1. تثبيت الحزم
```bash
cd education-platform
npm install
# أو
npm install --legacy-peer-deps
```

### 2. إعداد متغيرات البيئة
انسخ `.env.local` وملأ البيانات:
```bash
cp .env.local .env.local
```

**ملء الحقول:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key_here
```

### 3. إعداد Supabase Database

اذهب إلى **Supabase Console** → **SQL Editor** وقم بتشغيل الكود التالي:

```sql
-- جدول المستخدمين
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  phone text,
  password text not null, -- hashed
  role text check (role in ('super_admin', 'teacher', 'student')),
  is_approved boolean default false,
  current_session_token text,
  created_at timestamp default now()
);

-- جدول الدورات
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  teacher_id uuid references users(id) on delete cascade,
  price numeric default 0,
  thumbnail text,
  is_active boolean default true,
  created_at timestamp default now()
);

-- جدول الدروس
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration integer,
  lesson_order integer,
  created_at timestamp default now()
);

-- جدول الوصول للدورات
create table public.user_course_access (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  purchased_at timestamp default now(),
  expires_at timestamp,
  payment_proof text,
  unique(user_id, course_id)
);

-- تفعيل Row Level Security لاحقاً
alter table users enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table user_course_access enable row level security;
```

### 4. تشغيل المشروع

#### وضع التطوير:
```bash
npm run dev
# سيعمل على: http://localhost:3000
```

#### البناء للإنتاج:
```bash
npm run build
npm start
```

## 📋 الميزات المطبقة

✅ **نظام المصادقة:**
- تسجيل دخول وتسجيل آمن
- JWT Tokens
- حماية الصفحات (ProtectedRoute)

✅ **لوحات التحكم:**
- للطلاب: عرض الدورات المشتراة والتقدم
- للمعلمين: إدارة الدورات والدروس
- للمدير: إدارة شاملة للمستخدمين والدورات

✅ **حماية المحتوى:**
- علامات مائية ديناميكية (Watermark)
- مشغل فيديو آمن (SecureVideoPlayer)
- منع التحميل المباشر
- تتبع جلسات المستخدم

✅ **واجهة المستخدم:**
- تصميم عصري وظلام (Dark Mode)
- متجاوب (Responsive)
- Tailwind CSS

## 🔧 الملفات الرئيسية

### Authentication Flow:
1. `app/(auth)/login/page.tsx` - صفحة الدخول
2. `app/api/auth/login/route.ts` - معالج الدخول
3. `lib/supabase.ts` - كلاينت Supabase

### Protected Content:
1. `components/ProtectedRoute.tsx` - HOC للحماية
2. `components/Watermark.tsx` - العلامة المائية
3. `components/SecureVideoPlayer.tsx` - مشغل الفيديو

### Middleware:
- `middleware.ts` - فحص الترخيح على مستوى الطلب

## 📝 الخطوات التالية

1. **التخصيص:**
   - عدّل الألوان والموضوع حسب الحاجة
   - أضف شعار خاص بالمشروع
   - عدّل النصوص والترجمات

2. **إضافة ميزات:**
   - نظام الدفع (Stripe/PayPal)
   - الإشعارات
   - نظام التقييمات والتعليقات
   - لوحات بيانات متقدمة

3. **قاعدة البيانات:**
   - تفعيل Row Level Security
   - إضافة المؤشرات (Indexes)
   - إعداد النسخ الاحتياطية

4. **الأمان:**
   - تفعيل HTTPS
   - إضافة Rate Limiting
   - حماية CSRF
   - التحقق من البريد الإلكتروني

5. **الاختبار:**
   - اختبارات Unit (Jest)
   - اختبارات Integration (Playwright)
   - اختبارات الأمان

## 🎯 استخدام الواجهات

### تسجيل مستخدم جديد:
```bash
POST /api/auth/register
{
  "name": "أحمد",
  "email": "ahmad@example.com",
  "phone": "966501234567",
  "password": "SecurePass123",
  "role": "student"
}
```

### تسجيل الدخول:
```bash
POST /api/auth/login
{
  "email": "ahmad@example.com",
  "password": "SecurePass123"
}
```

### التحقق من التوكن:
```bash
POST /api/auth/verify
{
  "token": "your_jwt_token"
}
```

## 📚 الموارد والمراجع

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [HLS.js](https://github.com/video-dev/hls.js)

## ⚠️ ملاحظات مهمة

1. **المتغيرات السرية:**
   - لا تضع بيانات حقيقية في `.env.local`
   - استخدم متغيرات آمنة على الخادم

2. **الأداء:**
   - استخدم CDN لتوزيع الفيديوهات
   - قم بالتخزين المؤقت (Caching)

3. **الامتثال:**
   - التزم بقوانين الخصوصية (GDPR)
   - احتفظ بسجلات المستخدمين

## 📞 الدعم

لأي استفسارات أو مشاكل، تواصل مع فريق الدعم.

---

**آخر تحديث:** May 31, 2026
**الإصدار:** 1.0.0
