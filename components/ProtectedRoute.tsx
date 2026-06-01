'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token on the server
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          if (allowedRoles && !allowedRoles.includes(data.role)) {
            router.push('/unauthorized');
          } else {
            setIsAuthorized(true);
          }
        } else {
          router.push('/login');
        }
        setIsLoading(false);
      })
      .catch(() => {
        router.push('/login');
        setIsLoading(false);
      });
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">جاري التحقق...</div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
