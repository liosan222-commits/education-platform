'use client';

import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        جاري التحميل...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
