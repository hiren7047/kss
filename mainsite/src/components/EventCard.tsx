import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventCardProps {
  id?: string;
  title: string;
  titleGujarati: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  isPast?: boolean;
  status?: string;
  index?: number;
}

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(({
  id,
  title,
  titleGujarati,
  date,
  time,
  location,
  description,
  image,
  isPast = false,
  status,
  index = 0,
}, ref) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const getStatusBadge = () => {
    if (!status) return null;
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      planned: { label: t('events.status.planned') || 'Planned', variant: 'outline' },
      ongoing: { label: t('events.status.ongoing') || 'Ongoing', variant: 'default' },
      completed: { label: t('events.status.completed') || 'Completed', variant: 'secondary' },
      cancelled: { label: t('events.status.cancelled') || 'Cancelled', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || statusMap.planned;
    return (
      <Badge variant={statusInfo.variant} className="absolute top-3 right-3">
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`bg-card rounded-2xl overflow-hidden shadow-card border border-border group hover:shadow-lg transition-shadow ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      {image ? (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-muted">
                    <svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                `;
              }
            }}
          />
          {getStatusBadge()}
          {isPast && (
            <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
              <span className={`bg-background/90 px-4 py-2 rounded-full text-sm font-medium ${langClass}`}>
                {t('common.completed')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 bg-muted flex items-center justify-center">
          <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
          {getStatusBadge()}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div>
          <h3 className={`text-xl font-serif font-bold text-foreground mb-1 ${langClass}`}>
            {language === 'gu' ? titleGujarati : title}
          </h3>
          {language !== 'gu' && titleGujarati && titleGujarati !== title && (
            <p className="text-sm text-muted-foreground">{titleGujarati}</p>
          )}
        </div>

        <p className={`text-foreground/80 text-sm leading-relaxed line-clamp-2 ${langClass}`}>
          {description}
        </p>

        <div className="space-y-2 text-sm">
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} className="text-primary flex-shrink-0" />
              <span className={langClass}>{date}</span>
            </div>
          )}
          {time && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="text-primary flex-shrink-0" />
              <span className={langClass}>{time}</span>
            </div>
          )}
          {location && (
            <div className={`flex items-center gap-2 text-muted-foreground ${langClass}`}>
              <MapPin size={16} className="text-primary flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {!isPast && (
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            onClick={() => id && navigate(`/events/${id}`)}
          >
            <span className={langClass}>{t('common.viewDetails') || t('common.attendEvent') || 'View Details'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {isPast && id && (
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => navigate(`/events/${id}`)}
          >
            <span className={langClass}>{t('common.viewDetails') || 'View Details'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;