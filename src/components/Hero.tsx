'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from './animations';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Image
            src="/images/hero-interior.png"
            alt="Mac Daddy's Diner Interior"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="absolute top-0 left-0 right-0 h-2 bg-[#C41E3A] z-10 origin-left"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
          className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-6"
        >
          <Image
            src="/images/logo.avif"
            alt="Mac Daddy's Diner"
            fill
            sizes="(max-width: 768px) 192px, 256px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 drop-shadow-lg"
        >
          Mac Daddy&apos;s Diner
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="font-headline text-2xl md:text-3xl text-[#C41E3A] tracking-widest mb-6"
        >
          WHERE ROUTE 28 MEETS GOOD EATS
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="font-accent text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 italic"
        >
          Classic American comfort food, vintage vibes, and the spirit of the open road.
          Pull up a stool - you&apos;re family here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="#menu"
              className="btn btn-lg bg-[#C41E3A] hover:bg-[#a01830] text-white border-none font-headline tracking-wider text-xl px-8"
            >
              VIEW MENU
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="#contact"
              className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-black font-headline tracking-wider text-xl px-8"
            >
              FIND US
            </Link>
          </motion.div>
        </motion.div>

        {/* Hours Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1, type: 'spring', stiffness: 200 }}
          className="mt-12 inline-block bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border-2 border-[#C41E3A]"
        >
          <p className="font-headline text-[#C41E3A] text-lg tracking-wider mb-1">OPEN DAILY</p>
          <p className="font-headline text-white text-2xl tracking-wider">7:00 AM - 3:00 PM</p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
