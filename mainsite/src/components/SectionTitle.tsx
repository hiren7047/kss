import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  sanskritQuote?: string;
  centered?: boolean;
  light?: boolean;
}

const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(({
  title,
  subtitle,
  sanskritQuote,
  centered = true,
  light = false,
}, ref) => {
  const { language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {sanskritQuote && (
        <p className={`text-sm md:text-base font-serif italic mb-2 lang-hi ${light ? 'text-primary-foreground/70' : 'text-primary'}`}>
          ॥ {sanskritQuote} ॥
        </p>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 ${langClass} ${light ? 'text-primary-foreground' : 'text-foreground'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${langClass} ${light ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      )}
      <div className={`w-24 h-1 rounded-full mt-6 ${centered ? 'mx-auto' : ''} ${light ? 'bg-primary-foreground/30' : 'bg-primary'}`} />
    </motion.div>
  );
});

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;