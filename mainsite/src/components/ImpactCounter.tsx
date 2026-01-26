import { useEffect, useState, useRef, forwardRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  duration?: number;
}

const AnimatedCounter = forwardRef<HTMLDivElement, CounterProps>(({ 
  end, 
  suffix = '', 
  label, 
  icon, 
  duration = 2 
}, ref) => {
  const [count, setCount] = useState(0);
  const internalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { once: true, margin: '-100px' });
  const { language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={internalRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="impact-counter group"
    >
      <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <p className={`text-muted-foreground font-medium ${langClass}`}>{label}</p>
    </motion.div>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

export default AnimatedCounter;