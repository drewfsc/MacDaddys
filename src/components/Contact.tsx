'use client';

import siteContent from '@/data/siteContent.json';
import FeedbackForm from './FeedbackForm';
import { FadeIn, SlideIn, Stagger, StaggerItem, motion } from './animations';

export default function Contact() {
  const { business, hours } = siteContent;

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#1a1a1a] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-5xl md:text-6xl text-white mb-4">
            Visit Us
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 h-1 bg-[#C41E3A] mx-auto mb-4 origin-center"
          />
          <p className="font-accent text-xl text-gray-400 italic">
            Pull up a stool, stay a while
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Map / Location */}
          <SlideIn direction="left">
            {/* Map Embed */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-lg overflow-hidden retro-border mb-8"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.834!2d-70.2!3d41.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDQwJzEyLjAiTiA3MMKwMTInMDAuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </motion.div>

            {/* Address */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/5 rounded-lg p-6"
            >
              <h3 className="font-headline text-2xl text-[#C41E3A] tracking-wider mb-4">
                LOCATION
              </h3>
              <address className="not-italic">
                <p className="font-headline text-xl tracking-wide">{business.name}</p>
                <p className="text-gray-400 mt-2">{business.address.street}</p>
                <p className="text-gray-400">
                  {business.address.city}, {business.address.state} {business.address.zip}
                </p>
              </address>

              {/* Get Directions Button */}
              <motion.a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn bg-[#C41E3A] hover:bg-[#a01830] text-white border-none font-headline tracking-wider mt-4 inline-flex"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                GET DIRECTIONS
              </motion.a>
            </motion.div>
          </SlideIn>

          {/* Hours & Contact */}
          <SlideIn direction="right">
            {/* Hours */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/5 rounded-lg p-6 mb-8"
            >
              <h3 className="font-headline text-2xl text-[#C41E3A] tracking-wider mb-4">
                HOURS
              </h3>
              <Stagger className="space-y-2" fast>
                {daysOfWeek.map((day) => {
                  const dayHours = hours[day as keyof typeof hours];
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;

                  return (
                    <StaggerItem key={day}>
                      <motion.div
                        whileHover={{ x: 5, backgroundColor: 'rgba(196, 30, 58, 0.1)' }}
                        className={`flex justify-between items-center py-2 px-2 -mx-2 rounded border-b border-white/10 ${
                          isToday ? 'text-[#C41E3A]' : ''
                        }`}
                      >
                        <span className="font-headline tracking-wider capitalize">
                          {day}
                          {isToday && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 text-xs bg-[#C41E3A] text-white px-2 py-0.5 rounded-full"
                            >
                              Today
                            </motion.span>
                          )}
                        </span>
                        <span className="font-headline tracking-wider">
                          {dayHours.open} - {dayHours.close}
                        </span>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/5 rounded-lg p-6"
            >
              <h3 className="font-headline text-2xl text-[#C41E3A] tracking-wider mb-4">
                CONTACT
              </h3>

              {/* Phone */}
              <motion.a
                href={`tel:${business.phone.replace(/[^0-9]/g, '')}`}
                whileHover={{ x: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center gap-4 py-3 hover:text-[#C41E3A] transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-sm text-gray-400">Call us</p>
                  <p className="font-headline text-xl tracking-wider">{business.phone}</p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a
                href={`mailto:${business.email}`}
                whileHover={{ x: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center gap-4 py-3 hover:text-[#C41E3A] transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -15 }}
                  className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-sm text-gray-400">Email us</p>
                  <p className="font-headline text-xl tracking-wider">{business.email}</p>
                </div>
              </motion.a>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                <motion.a
                  href={siteContent.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </motion.a>
                <motion.a
                  href={siteContent.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </SlideIn>
        </div>

        {/* Feedback Form Section */}
        <FadeIn className="max-w-2xl mx-auto">
          <FeedbackForm />
        </FadeIn>
      </div>
    </section>
  );
}
