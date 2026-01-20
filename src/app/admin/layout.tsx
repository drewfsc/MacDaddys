'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmModal';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setAuthenticated(data.authenticated);
    } catch {
      setAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setAuthenticated(true);
        setPassword('');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthenticated(false);
    router.push('/admin');
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white font-headline text-2xl animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image
                src="/images/logo.avif"
                alt="Mac Daddy's"
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <h1 className="font-headline text-3xl text-[#1a1a1a] tracking-wider">
              ADMIN LOGIN
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-headline text-sm text-gray-600 tracking-wider">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C41E3A] focus:outline-none font-sans"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C41E3A] text-white font-headline tracking-wider py-3 rounded-lg hover:bg-[#a01830] transition-colors disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-[#C41E3A] text-sm"
            >
              &larr; Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Admin Header */}
          <header className="bg-[#1a1a1a] text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="flex items-center gap-2">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/images/logo.avif"
                      alt="Mac Daddy's"
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-headline text-xl tracking-wider hidden sm:block">
                    ADMIN
                  </span>
                </Link>

                <nav className="flex gap-2 ml-8">
                  <Link
                    href="/admin/menu"
                    className={`px-4 py-2 rounded font-headline tracking-wider text-sm transition-colors ${
                      pathname === '/admin/menu'
                        ? 'bg-[#C41E3A] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    MENU
                  </Link>
                  <Link
                    href="/admin/specials"
                    className={`px-4 py-2 rounded font-headline tracking-wider text-sm transition-colors ${
                      pathname === '/admin/specials'
                        ? 'bg-[#C41E3A] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    SPECIALS
                  </Link>
                  <Link
                    href="/admin/gallery"
                    className={`px-4 py-2 rounded font-headline tracking-wider text-sm transition-colors ${
                      pathname === '/admin/gallery'
                        ? 'bg-[#C41E3A] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    GALLERY
                  </Link>
                  <Link
                    href="/admin/feedback"
                    className={`px-4 py-2 rounded font-headline tracking-wider text-sm transition-colors ${
                      pathname === '/admin/feedback'
                        ? 'bg-[#C41E3A] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    FEEDBACK
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  target="_blank"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  View Site &rarr;
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-[#C41E3A] text-sm font-headline tracking-wider"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
