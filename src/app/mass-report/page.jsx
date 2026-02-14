"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MassReportDashboard from '@/components/mass-report/MassReportDashboard';

export default function MassReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (!res.ok) {
          router.push('/mass-report/login');
        }
      } catch (error) {
        router.push('/mass-report/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <MassReportDashboard />;
}
