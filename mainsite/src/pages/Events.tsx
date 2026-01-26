import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Loader2, Clock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';

const Events = () => {
  const [showPast, setShowPast] = useState(false);
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch page content
  const { data: pageContent } = useQuery({
    queryKey: ['pageContent', 'events', language],
    queryFn: () => publicApi.getPageContent('events', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch events
  const { data: upcomingEventsData, isLoading: upcomingLoading, isError: upcomingError } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => publicApi.getEvents({ upcoming: true, limit: 100 }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: pastEventsData, isLoading: pastLoading, isError: pastError } = useQuery({
    queryKey: ['events', 'past'],
    queryFn: () => publicApi.getEvents({ upcoming: false, limit: 100 }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');

  // Transform events with proper formatting
  const transformEvent = (event: any) => {
    const mainsiteDisplay = event.mainsiteDisplay || {};
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate || event.startDate);
    const isPast = endDate < new Date();

    // Format date range
    let dateDisplay = '';
    const dateFormat = language === 'gu' ? 'dd MMM, yyyy' : language === 'hi' ? 'dd MMM, yyyy' : 'MMM dd, yyyy';
    if (startDate.toDateString() === endDate.toDateString()) {
      dateDisplay = format(startDate, dateFormat);
    } else {
      dateDisplay = `${format(startDate, dateFormat)} - ${format(endDate, dateFormat)}`;
    }

    // Format time
    let timeDisplay = '';
    if (mainsiteDisplay.time && mainsiteDisplay.time.includes(':')) {
      // If mainsiteDisplay.time contains time info, use it
      timeDisplay = mainsiteDisplay.time;
    } else {
      // Format time from dates
      timeDisplay = format(startDate, 'h:mm a');
      if (startDate.toDateString() !== endDate.toDateString() || 
          format(startDate, 'h:mm a') !== format(endDate, 'h:mm a')) {
        timeDisplay += ` - ${format(endDate, 'h:mm a')}`;
      }
    }

    // Handle image URL
    let imageUrl = '';
    if (mainsiteDisplay.featuredImage) {
      if (mainsiteDisplay.featuredImage.startsWith('http')) {
        imageUrl = mainsiteDisplay.featuredImage;
      } else if (mainsiteDisplay.featuredImage.startsWith('/uploads')) {
        imageUrl = `${API_BASE_URL.replace('/api', '')}${mainsiteDisplay.featuredImage}`;
      } else {
        imageUrl = `${API_BASE_URL.replace('/api', '')}/uploads/${mainsiteDisplay.featuredImage}`;
      }
    }

    // Get title in current language
    const title = event.translations?.[language]?.title || 
                  event.translations?.en?.title || 
                  event.name || 
                  'Event';
    
    // Get title in Gujarati for display
    const titleGujarati = event.translations?.gu?.title || 
                          event.translations?.en?.title || 
                          event.name || 
                          'Event';

    // Get description
    const description = mainsiteDisplay.shortDescription || 
                       event.translations?.[language]?.description || 
                       event.translations?.en?.description || 
                       event.description || 
                       '';

    // Get location
    const location = mainsiteDisplay.location?.name || 
                    mainsiteDisplay.location?.address || 
                    event.location || 
                    '';

    return {
      id: event._id,
      title,
      titleGujarati,
      date: dateDisplay,
      time: timeDisplay,
      location,
      description,
      image: imageUrl,
      isPast,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
    };
  };

  const upcomingEvents = upcomingEventsData?.data?.map(transformEvent) || [];
  const pastEvents = pastEventsData?.data?.map(transformEvent) || [];

  const festivals = [
    { name: t('events.festivals.diwali'), month: language === 'gu' ? 'ઓક્ટો/નવે' : language === 'hi' ? 'अक्टू/नव' : 'Oct/Nov' },
    { name: t('events.festivals.holi'), month: language === 'gu' ? 'માર્ચ' : language === 'hi' ? 'मार्च' : 'March' },
    { name: t('events.festivals.navratri'), month: language === 'gu' ? 'ઓક્ટોબર' : language === 'hi' ? 'अक्टूबर' : 'October' },
    { name: t('events.festivals.janmashtami'), month: language === 'gu' ? 'ઓગસ્ટ' : language === 'hi' ? 'अगस्त' : 'August' },
  ];

  const currentEvents = showPast ? pastEvents : upcomingEvents;
  const isLoading = showPast ? pastLoading : upcomingLoading;
  const hasError = showPast ? pastError : upcomingError;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-primary-foreground/80 font-serif text-lg mb-4 lang-hi">
              ॥ {t('events.heroQuote')} ॥
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {heroSection?.title || t('events.heroTitle')}
            </h1>
            <p className={`text-xl text-primary-foreground/80 ${langClass}`}>
              {heroSection?.subtitle || t('events.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <Button 
              variant={!showPast ? 'default' : 'outline'} 
              onClick={() => setShowPast(false)} 
              className="rounded-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className={langClass}>{t('events.upcomingEvents')}</span>
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {upcomingEvents.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant={showPast ? 'default' : 'outline'} 
              onClick={() => setShowPast(true)} 
              className="rounded-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className={langClass}>{t('events.pastEvents')}</span>
              {pastEvents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pastEvents.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title={showPast ? t('events.pastEvents') : t('events.upcomingEvents')} 
            subtitle={showPast ? t('events.pastSubtitle') : t('events.upcomingSubtitle')} 
          />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <p className={`text-destructive mb-2 ${langClass}`}>
                {t('events.error') || 'Failed to load events'}
              </p>
              <p className={`text-sm text-muted-foreground ${langClass}`}>
                {t('events.errorDesc') || 'Please try again later'}
              </p>
            </div>
          ) : currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentEvents.map((event, index) => (
                <EventCard 
                  key={event.id || index} 
                  {...event} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className={`text-foreground/60 text-lg ${langClass}`}>
                {t('events.noEvents')}
              </p>
              <p className={`text-sm text-muted-foreground mt-2 ${langClass}`}>
                {showPast 
                  ? (t('events.noPastEvents') || 'No past events available')
                  : (t('events.noUpcomingEvents') || 'No upcoming events scheduled')
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Festivals Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title={t('events.festivalsTitle')} 
            subtitle={t('events.festivalsSubtitle')} 
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {festivals.map((festival, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ delay: index * 0.05 }} 
                viewport={{ once: true }} 
                className="bg-background rounded-xl p-4 text-center shadow-card border border-border hover:border-primary/50 transition-colors"
              >
                <p className={`font-semibold text-foreground ${langClass}`}>{festival.name}</p>
                <p className={`text-sm text-muted-foreground ${langClass}`}>{festival.month}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
