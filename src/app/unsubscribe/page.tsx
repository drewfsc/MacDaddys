'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const typeLabels: Record<string, string> = {
  all: 'all emails',
  dailySpecials: 'daily specials & promotions',
  eventsAnnouncements: 'events & announcements',
  feedbackReplies: 'feedback reply notifications',
};

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');
  const type = searchParams.get('type') || 'all';

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFF8E7] rounded-lg p-8 max-w-md w-full shadow-2xl text-center"
        >
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Image
              src="/images/logo.avif"
              alt="Mac Daddy's Diner"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          {/* Error Icon */}
          <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-[#1a1a1a] mb-4">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-8">
            {error === 'invalid'
              ? 'This unsubscribe link is invalid or has expired.'
              : 'An error occurred while processing your request.'}
          </p>

          <Link
            href="/"
            className="inline-block bg-[#C41E3A] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-[#a01830] transition-colors"
          >
            BACK TO MENU
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFF8E7] rounded-lg p-8 max-w-md w-full shadow-2xl text-center"
        >
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Image
              src="/images/logo.avif"
              alt="Mac Daddy's Diner"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="font-display text-3xl text-[#1a1a1a] mb-4">
            Unsubscribed
          </h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve been unsubscribed from {typeLabels[type] || 'our emails'}.
          </p>

          <div className="bg-white rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">
              <strong className="font-headline">Changed your mind?</strong><br />
              You can manage your email preferences anytime by signing in to your account.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-[#C41E3A] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-[#a01830] transition-colors"
            >
              MANAGE PREFERENCES
            </Link>
            <Link
              href="/"
              className="block w-full bg-[#1a1a1a] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              BACK TO MENU
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            We&apos;re sad to see you go, but we respect your choice.
          </p>
        </motion.div>
      </div>
    );
  }

  // Default state (shouldn't normally be reached)
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="bg-[#FFF8E7] rounded-lg p-8 max-w-md w-full shadow-2xl text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <Image
            src="/images/logo.avif"
            alt="Mac Daddy's Diner"
            fill
            sizes="80px"
            className="object-contain"
          />
        </div>
        <h1 className="font-display text-3xl text-[#1a1a1a] mb-4">
          Unsubscribe
        </h1>
        <p className="text-gray-600 mb-8">
          Use the link in your email to manage your subscription preferences.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#C41E3A] text-white font-headline tracking-wider py-3 px-6 rounded-lg hover:bg-[#a01830] transition-colors"
        >
          BACK TO MENU
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white font-headline text-xl animate-pulse">Loading...</div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
