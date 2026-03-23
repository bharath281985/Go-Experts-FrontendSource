import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUp({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      countRef.current = end * easeOutQuart;
      
      setCount(countRef.current);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      startTimeRef.current = 0;
    };
  }, [end, duration]);

  const formattedValue = count.toFixed(decimals);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  );
}
