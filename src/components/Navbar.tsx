'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, showUserMenu]);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#menu', label: 'Menu' },
    { href: '#about', label: 'About' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 md:w-16 md:h-16"
            >
              <Image
                src="/images/logo.avif"
                alt="Mac Daddy's Diner"
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="font-headline text-xl md:text-2xl text-white tracking-wider hidden sm:block">
              MAC DADDY&apos;S
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="font-headline text-lg text-white hover:text-[#C41E3A] transition-colors tracking-wide retro-underline"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-[#C41E3A]"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-[#C41E3A] rounded-full flex items-center justify-center text-white font-bold">
                      {session.user?.name?.[0] || 'U'}
                    </div>
                  )}
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="font-headline text-sm text-gray-500">Signed in as</p>
                        <p className="font-headline truncate">{session.user?.name || session.user?.email?.split('@')[0]}</p>
                      </div>
                      <Link
                        href="/account/preferences"
                        onClick={() => setShowUserMenu(false)}
                        className="block w-full text-left px-4 py-2 font-headline text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Email Preferences
                      </Link>
                      <motion.button
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2 font-headline text-sm text-gray-700"
                      >
                        Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center gap-2 bg-[#C41E3A] text-white px-4 py-2 rounded font-headline tracking-wider hover:bg-[#a01830] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    JOIN
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Auth */}
            {status !== 'loading' && session ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-[#C41E3A]"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#C41E3A] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {session.user?.name?.[0] || 'U'}
                    </div>
                  )}
                </motion.button>
              </div>
            ) : status !== 'loading' ? (
              <Link href="/login" className="text-[#C41E3A]">
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </motion.div>
              </Link>
            ) : null}

            <motion.button
              className="text-white p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.path
                      key="close"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <motion.g key="menu">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-gray-700"
            >
              <div className="py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3 font-headline text-xl text-white hover:text-[#C41E3A] transition-colors tracking-wide text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {session && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="block w-full py-3 font-headline text-xl text-[#C41E3A] tracking-wide text-center"
                  >
                    SIGN OUT
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile User Menu */}
        <AnimatePresence>
          {showUserMenu && session && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="md:hidden absolute right-4 top-16 w-48 bg-white rounded-lg shadow-xl py-2 z-50"
            >
              <div className="px-4 py-2 border-b">
                <p className="font-headline text-sm text-gray-500">Signed in as</p>
                <p className="font-headline truncate">{session.user?.name}</p>
              </div>
              <Link
                href="/account/preferences"
                onClick={() => setShowUserMenu(false)}
                className="block w-full text-left px-4 py-2 font-headline text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Email Preferences
              </Link>
              <motion.button
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full text-left px-4 py-2 font-headline text-sm text-gray-700"
              >
                Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative stripe */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-1 bg-gradient-to-r from-[#C41E3A] via-[#FFF8E7] to-[#C41E3A] origin-left"
      />
    </motion.nav>
  );
}
