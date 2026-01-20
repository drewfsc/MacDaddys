'use client';

import Image from 'next/image';
import siteContent from '@/data/siteContent.json';
import { FadeIn, SlideIn, Stagger, StaggerItem, ScaleIn, motion } from './animations';

export default function About() {
  const { about, features } = siteContent;

  return (
    <section id="about" className="py-16 md:py-24 bg-[#1a1a1a] text-white overflow-hidden">
      {/* Decorative top stripe */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="diner-divider mb-16 origin-left"
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl text-white mb-4">
            Our Story
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 h-1 bg-[#C41E3A] mx-auto mb-4 origin-center"
          />
          <p className="font-headline text-2xl text-[#C41E3A] tracking-widest">
            {about.headline.toUpperCase()}
          </p>
        </FadeIn>

        {/* Story Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image Side */}
          <SlideIn direction="left" className="relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden retro-border">
              <Image
                src="/images/about-interior.png"
                alt="Inside Mac Daddy's Diner"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative badge */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ scale: 1, rotate: 12 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="absolute -bottom-6 -right-6 bg-[#C41E3A] text-white rounded-full w-32 h-32 flex items-center justify-center shadow-xl"
            >
              <div className="text-center -rotate-12">
                <p className="font-headline text-sm">EST.</p>
                <p className="font-display text-3xl">{siteContent.business.established}</p>
              </div>
            </motion.div>
          </SlideIn>

          {/* Text Side */}
          <SlideIn direction="right">
            <p className="font-accent text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              {about.story}
            </p>

            {/* Values */}
            <Stagger className="space-y-4">
              {about.values.map((value, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ x: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 180, scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-3 h-3 bg-[#C41E3A] rotate-45"
                    />
                    <span className="font-headline text-lg tracking-wide">{value}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </SlideIn>
        </div>

        {/* Features */}
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white/5 backdrop-blur rounded-lg p-8 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  {index === 0 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </motion.div>
                <h3 className="font-headline text-xl text-[#C41E3A] tracking-wider mb-2">
                  {feature.title.toUpperCase()}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Team Section */}
        <div className="mt-20">
          <FadeIn className="text-center mb-12">
            <h3 className="font-headline text-3xl text-[#C41E3A] tracking-widest">
              MEET THE CREW
            </h3>
          </FadeIn>
          <Stagger className="flex flex-wrap justify-center gap-8">
            {siteContent.team.map((member, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="text-center max-w-sm"
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#C41E3A]"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <h4 className="font-headline text-2xl tracking-wide">{member.name}</h4>
                  <p className="font-accent text-[#C41E3A] italic mb-2">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.bio}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* Decorative bottom stripe */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="diner-divider mt-16 origin-right"
      />
    </section>
  );
}
