import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * FadeSection — fade-in-up on scroll using IntersectionObserver.
 * Extracted from BelowFold so any component can use it.
 *
 * Props:
 *   delay     number   animation delay in seconds (default 0)
 *   children  node
 */
export default function FadeSection({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
