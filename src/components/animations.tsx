'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10, scale: 0.9 },
  visible: { opacity: 1, rotate: 0, scale: 1 }
};

// Stagger container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// Stagger item for use inside stagger containers
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

// Scroll-triggered fade in animation
export function FadeIn({
  children,
  className = '',
  variants = fadeInUp,
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3
}: AnimatedProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from specified direction
interface SlideInProps extends AnimatedProps {
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function SlideIn({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3
}: SlideInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight
  }[direction];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation (good for images, cards)
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3
}: AnimatedProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={scaleIn}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pop in animation with spring (great for buttons, badges)
export function PopIn({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.3
}: AnimatedProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={popIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container that animates children one by one
interface StaggerProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

export function Stagger({
  children,
  className = '',
  fast = false,
  once = true,
  amount = 0.2
}: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fast ? staggerContainerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Item to be used inside Stagger
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// Hero-specific animations (no scroll trigger, animate on mount)
export function HeroFadeIn({
  children,
  className = '',
  delay = 0,
  duration = 0.8
}: Omit<AnimatedProps, 'once' | 'amount'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 0.8
}: Omit<AnimatedProps, 'once' | 'amount'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll effect
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function Parallax({ children, className = '', offset = 50 }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: offset }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const hoverLift = {
  whileHover: { y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

// Animated text that reveals word by word
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedText({ text, className = '', delay = 0, once = true }: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const words = text.split(' ');

  return (
    <motion.span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: delay + i * 0.05 }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Re-export motion for direct use
export { motion };
