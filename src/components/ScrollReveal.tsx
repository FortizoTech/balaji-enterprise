'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: Props) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
