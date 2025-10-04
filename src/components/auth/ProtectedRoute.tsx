'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'dosen' | 'admin';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If specific role is required and user doesn't have it, redirect to unauthorized
      if (requiredRole && user.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children (redirect will happen)
  if (!user) {
    return null;
  }

  // If specific role is required and user doesn't have it, don't render children
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
}