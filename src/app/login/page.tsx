'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: '/#menu',
      });

      if (result?.error) {
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Redirect to verify-request page
        window.location.href = '/auth/verify-request?email=' + encodeURIComponent(email);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#FFF8E7] rounded-lg p-8 max-w-md w-full shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative w-24 h-24 mx-auto mb-4"
          >
            <Image
              src="/images/logo.avif"
              alt="Mac Daddy's Diner"
              fill
              sizes="96px"
              className="object-contain"
            />
          </motion.div>
          <h1 className="font-display text-3xl text-[#1a1a1a]">
            Sign In
          </h1>
          <p className="text-gray-600 mt-2 font-accent italic">
            We&apos;ll send you a magic link to sign in
          </p>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-headline text-sm text-gray-700 mb-1">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C41E3A] focus:outline-none transition-colors font-accent"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || !email}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#C41E3A] text-white font-headline tracking-wider py-3 px-4 rounded-lg hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                SEND MAGIC LINK
              </>
            )}
          </motion.button>
        </form>

        {/* How it works */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">How it works</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-sm">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0 font-headline text-white">
              1
            </div>
            <span className="text-gray-700">Enter your email address above</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0 font-headline text-white">
              2
            </div>
            <span className="text-gray-700">Check your inbox for a sign-in link</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0 font-headline text-white">
              3
            </div>
            <span className="text-gray-700">Click the link to sign in - no password needed!</span>
          </motion.div>
        </div>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="font-headline text-sm text-gray-700 mb-2">MEMBER BENEFITS</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C41E3A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Heart your favorite dishes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C41E3A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Get updates on specials & events
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C41E3A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Exclusive offers for subscribers
            </li>
          </ul>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          No password required. We&apos;ll send a secure link to your email.
        </p>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[#C41E3A] hover:underline font-headline tracking-wider"
          >
            &larr; BACK TO MENU
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
