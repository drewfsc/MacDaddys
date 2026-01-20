'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationPreferences from '@/components/account/NotificationPreferences';
import { ToastProvider } from '@/components/ui/Toast';

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-[#1a1a1a] font-headline text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FFF8E7]">
        {/* Header */}
        <header className="bg-[#1a1a1a] text-white">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.avif"
                  alt="Mac Daddy's Diner"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-headline text-xl tracking-wider hidden sm:block">
                MAC DADDY&apos;S
              </span>
            </Link>
            <Link
              href="/"
              className="font-headline text-sm tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              &larr; BACK TO MENU
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-display text-4xl text-[#1a1a1a]">Account Settings</h1>
            <p className="text-gray-600 mt-2">
              Signed in as <span className="font-semibold">{session.user?.email}</span>
            </p>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center text-white font-display text-2xl">
                {session.user?.name?.charAt(0)?.toUpperCase() || session.user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="font-headline text-xl text-[#1a1a1a]">
                  {session.user?.name || 'Member'}
                </h2>
                <p className="text-gray-600">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <NotificationPreferences />

          {/* Sign Out */}
          <div className="mt-8 text-center">
            <Link
              href="/api/auth/signout"
              className="text-[#C41E3A] hover:underline font-headline tracking-wider"
            >
              SIGN OUT
            </Link>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
