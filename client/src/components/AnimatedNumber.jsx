import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value, format = (v) => v.toFixed(2), duration = 1.5 }) {
  const spring = useSpring(0, {
    stiffness: 60,
    damping: 30,
    mass: 1,
  });

  const display = useTransform(spring, (v) => format(v));
  const [displayValue, setDisplayValue] = useState(format(0));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {displayValue}
    </motion.span>
  );
}
