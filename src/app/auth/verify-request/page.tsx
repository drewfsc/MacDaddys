'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

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

        {/* Email Icon Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.svg
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </motion.svg>
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-3xl text-[#1a1a1a] mb-4">
          Check Your Email
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          We sent a magic sign-in link to:
        </p>
        <p className="font-headline text-lg text-[#C41E3A] mb-6">
          {email || 'your email'}
        </p>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600">
            <strong className="font-headline">Click the link</strong> in the email to sign in.
            The link expires in 15 minutes.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">Didn&apos;t receive it?</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Tips */}
        <ul className="text-sm text-gray-600 space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C41E3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Check your spam or junk folder
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C41E3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Make sure the email address is correct
          </li>
        </ul>

        {/* Try Again Link */}
        <Link
          href="/login"
          className="inline-block bg-[#1a1a1a] text-white font-headline tracking-wider py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
        >
          TRY AGAIN
        </Link>

        {/* Back link */}
        <div className="mt-6">
          <Link
            href="/"
            className="text-[#C41E3A] hover:underline font-headline tracking-wider text-sm"
          >
            &larr; BACK TO MENU
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white font-headline text-xl animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}
