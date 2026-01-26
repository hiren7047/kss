import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  image?: string;
  index?: number;
}

const TestimonialCard = forwardRef<HTMLDivElement, TestimonialProps>(({ 
  quote, 
  name, 
  role, 
  image, 
  index = 0 
}, ref) => {
  const { language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border relative"
    >
      <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
      
      <p className={`text-foreground/80 leading-relaxed mb-6 italic ${langClass}`}>
        "{quote}"
      </p>

      <div className="flex items-center gap-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-serif font-bold text-primary">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className={`font-semibold text-foreground ${langClass}`}>{name}</p>
          <p className={`text-sm text-muted-foreground ${langClass}`}>{role}</p>
        </div>
      </div>
    </motion.div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export default TestimonialCard;