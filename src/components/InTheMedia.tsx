'use client';

import { FadeIn, motion } from './animations';

export default function InTheMedia() {
  return (
    <section id="media" className="py-16 md:py-24 bg-[#FFF8E7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-5xl md:text-6xl text-[#1a1a1a] mb-4">
            In The Media
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 h-1 bg-[#C41E3A] mx-auto mb-4 origin-center"
          />
          <p className="font-headline text-2xl text-[#C41E3A] tracking-widest">
            AS SEEN ON TV
          </p>
        </FadeIn>

        {/* Video Embed */}
        <FadeIn className="max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative aspect-video rounded-lg overflow-hidden shadow-2xl retro-border"
          >
            <iframe
              src="https://www.youtube.com/embed/BryAyGP_WW4"
              title="Mac Daddy's Diner - News Feature"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
