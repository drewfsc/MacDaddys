'use client';

import Image from 'next/image';
import Link from 'next/link';
import siteContent from '@/data/siteContent.json';
import { FadeIn, Stagger, StaggerItem, motion } from './animations';

export default function Footer() {
  const { business, social } = siteContent;
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '#home', label: 'HOME' },
    { href: '#menu', label: 'MENU' },
    { href: '#about', label: 'ABOUT' },
    { href: '#gallery', label: 'GALLERY' },
    { href: '#contact', label: 'CONTACT' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Checkered divider */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="h-4 checkered"
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo & Tagline */}
          <FadeIn className="text-center md:text-left">
            <Link href="#home" className="inline-flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative w-16 h-16"
              >
                <Image
                  src="/images/logo.avif"
                  alt="Mac Daddy's Diner"
                  fill
                  className="object-contain"
                />
              </motion.div>
              <div>
                <span className="font-headline text-2xl tracking-wider block">
                  MAC DADDY&apos;S
                </span>
                <span className="font-accent text-sm text-[#C41E3A] italic">
                  Where Route 28 Meets Good Eats
                </span>
              </div>
            </Link>
          </FadeIn>

          {/* Quick Links */}
          <FadeIn delay={0.1} className="text-center">
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="font-headline tracking-wider hover:text-[#C41E3A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </FadeIn>

          {/* Social Links */}
          <FadeIn delay={0.2} className="text-center md:text-right">
            <div className="flex justify-center md:justify-end gap-4">
              <motion.a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 10, backgroundColor: '#C41E3A' }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </motion.a>
              <motion.a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -10, backgroundColor: '#C41E3A' }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </motion.a>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Bar */}
        <FadeIn delay={0.3}>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-8 pt-8 border-t border-white/10 text-center origin-center"
          >
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} {business.name}. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
            </p>
          </motion.div>
        </FadeIn>
      </div>
    </footer>
  );
}
