'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; message: string }> = {
  Verification: {
    title: 'Link Expired',
    message: 'This magic link has expired or has already been used. Please request a new one.',
  },
  Configuration: {
    title: 'Configuration Error',
    message: 'There was a problem with the server configuration. Please try again later.',
  },
  AccessDenied: {
    title: 'Access Denied',
    message: 'You do not have permission to sign in.',
  },
  Default: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#FFF8E7] rounded-lg p-8 max-w-md w-full shadow-2xl text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          <Image
            src="/images/logo.avif"
            alt="Mac Daddy's Diner"
            fill
            sizes="80px"
            className="object-contain"
          />
        </motion.div>

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-3xl text-[#1a1a1a] mb-4">
          {errorInfo.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {errorInfo.message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-[#C41E3A] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-[#a01830] transition-colors"
          >
            TRY AGAIN
          </Link>
          <Link
            href="/"
            className="block w-full bg-[#1a1a1a] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            BACK TO MENU
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, please contact us.
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white font-headline text-xl animate-pulse">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
