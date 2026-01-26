import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface DurgaCardProps {
  id: string;
  name: string;
  nameGujarati: string;
  description: string;
  meaning: string;
  icon: React.ReactNode;
  image: string;
  activities: string[];
  color: string;
  index?: number;
}

const DurgaCard = forwardRef<HTMLDivElement, DurgaCardProps>(({
  id,
  name,
  nameGujarati,
  description,
  meaning,
  icon,
  image,
  activities,
  color,
  index = 0,
}, ref) => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Get translated durga data
  const durgaKey = id as 'saraswati' | 'annapurna' | 'ganga' | 'kali' | 'lakshmi';
  const translatedName = t(`durgas.${durgaKey}.nameGujarati`);
  const translatedMeaning = language === 'en' ? t(`durgas.${durgaKey}.meaning`) : t(`durgas.${durgaKey}.meaningGujarati`);
  const translatedDescription = t(`durgas.${durgaKey}.description`);
  const translatedEnName = t(`durgas.${durgaKey}.name`);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="durga-card group"
    >
      {/* Top gradient bar based on durga theme */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl"
        style={{ background: color }}
      />
      
      {/* Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            {icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground"
              style={{ background: color }}
            >
              {icon}
            </div>
            <div>
              <h3 className={`text-xl font-serif font-bold text-primary-foreground ${langClass}`}>{translatedName}</h3>
              <p className="text-sm text-primary-foreground/80">{translatedEnName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className={`text-sm text-muted-foreground italic border-l-2 border-accent pl-3 ${langClass}`}>
          {translatedMeaning}
        </p>
        
        <p className={`text-foreground/80 text-sm leading-relaxed ${langClass}`}>
          {translatedDescription}
        </p>

        {/* Activities */}
        <div className="space-y-2">
          <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wide ${langClass}`}>
            {t('common.activities')}
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.slice(0, 3).map((activity, i) => {
              // Try to get translated activity
              const activityKeys = ['activities.0', 'activities.1', 'activities.2'];
              const translatedActivity = t(`durgas.${durgaKey}.${activityKeys[i]}`) !== `durgas.${durgaKey}.${activityKeys[i]}` 
                ? t(`durgas.${durgaKey}.${activityKeys[i]}`)
                : activity;
              return (
                <span
                  key={activity}
                  className={`text-xs bg-secondary px-3 py-1 rounded-full text-secondary-foreground ${langClass}`}
                >
                  {translatedActivity}
                </span>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant="ghost"
          className="w-full mt-4 group/btn hover:bg-primary hover:text-primary-foreground"
        >
          <Link to={`/durga/${id}`}>
            <span className={langClass}>{t('common.learnMore')}</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
});

DurgaCard.displayName = 'DurgaCard';

export default DurgaCard;