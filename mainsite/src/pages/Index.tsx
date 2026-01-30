import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, ArrowRight, BookOpen, Utensils, Droplets, HeartPulse, Coins, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import DurgaCard from '@/components/DurgaCard';
import ImpactCounter from '@/components/ImpactCounter';
import TestimonialCard from '@/components/TestimonialCard';
import EventCard from '@/components/EventCard';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-bg.jpg';
import saraswatiImg from '@/assets/durga-saraswati.jpg';
import annapurnaImg from '@/assets/durga-annapurna.jpg';
import gangaImg from '@/assets/durga-ganga.jpg';
import kaliImg from '@/assets/durga-kali.jpg';
import lakshmiImg from '@/assets/durga-lakshmi.jpg';

const durgaIcons: Record<string, React.ReactNode> = {
  saraswati: <BookOpen className="w-6 h-6" />,
  annapurna: <Utensils className="w-6 h-6" />,
  ganga: <Droplets className="w-6 h-6" />,
  kali: <HeartPulse className="w-6 h-6" />,
  lakshmi: <Coins className="w-6 h-6" />,
};

const Index = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch page content
  const { data: pageContent, isLoading: pageLoading, isError: pageError } = useQuery({
    queryKey: ['pageContent', 'home', language],
    queryFn: () => publicApi.getPageContent('home', language),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Fetch Durga content
  const { data: durgaData, isLoading: durgaLoading, isError: durgaError } = useQuery({
    queryKey: ['durgaContent'],
    queryFn: () => publicApi.getDurgaContent(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch Impact Numbers
  const { data: impactData, isLoading: impactLoading, isError: impactError } = useQuery({
    queryKey: ['impactNumbers', language],
    queryFn: () => publicApi.getImpactNumbers(language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch Testimonials
  const { data: testimonialsData, isLoading: testimonialsLoading, isError: testimonialsError } = useQuery({
    queryKey: ['testimonials', language],
    queryFn: () => publicApi.getTestimonials(language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch Events
  const { data: eventsData, isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => publicApi.getEvents({ upcoming: true, limit: 2 }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Get hero section from page content
  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');
  const missionSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'mission');
  const durgaSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'durga-system');

  // Transform impact numbers
  const impactNumbers = impactData?.data?.map((item: any, index: number) => {
    const icons = [
      <Utensils className="w-10 h-10" />,
      <Heart className="w-10 h-10" />,
      <HeartPulse className="w-10 h-10" />,
      <Calendar className="w-10 h-10" />,
    ];
    return {
      end: item.value || 0,
      suffix: item.suffix || '+',
      label: item.label || '',
      icon: icons[index] || <Heart className="w-10 h-10" />,
    };
  }) || [];

  // Transform testimonials
  const testimonials = testimonialsData?.data?.map((item: any) => ({
    quote: item.quote || '',
    name: item.name || '',
    role: item.role || '',
    photo: item.photo,
  })) || [];

  // Transform events
  const upcomingEvents = eventsData?.data?.map((event: any) => {
    const mainsiteDisplay = event.mainsiteDisplay || {};
    return {
      title: event.translations?.[language]?.title || event.title || '',
      titleGujarati: event.translations?.gu?.title || event.title || '',
      date: mainsiteDisplay.time || new Date(event.startDate).toLocaleDateString(),
      time: mainsiteDisplay.time || '',
      location: mainsiteDisplay.location?.name || '',
      description: mainsiteDisplay.shortDescription || event.description || '',
    };
  }) || [];

  // Default images fallback
  const defaultImages: Record<string, string> = {
    saraswati: saraswatiImg,
    annapurna: annapurnaImg,
    ganga: gangaImg,
    kali: kaliImg,
    lakshmi: lakshmiImg,
  };

  // Transform durgas
  const durgas = durgaData?.data?.map((durga: any) => ({
    id: durga.durgaId,
    name: durga.name,
    nameGujarati: durga.nameGujarati || durga.name,
    meaning: durga.meaning || '',
    meaningGujarati: durga.meaningGujarati || '',
    description: durga.description || '',
    descriptionLong: durga.descriptionLong || '',
    image: durga.imageUrl || defaultImages[durga.durgaId] || '',
    activities: durga.activities || [],
    activitiesDetailed: durga.activitiesDetailed || [],
    color: durga.color || '',
    impactNumbers: durga.impactNumbers || [],
  })) || [];

  const isLoading = pageLoading || durgaLoading || impactLoading || testimonialsLoading || eventsLoading;
  const hasError = pageError || durgaError || impactError || testimonialsError || eventsError;

  const newsletterMutation = useMutation({
    mutationFn: (payload: { email: string; name?: string }) =>
      publicApi.subscribeNewsletter({
        ...payload,
        language: language as 'en' | 'gu' | 'hi',
      }),
    onSuccess: () => {
      setNewsletterEmail('');
      setNewsletterName('');
      setNewsletterStatus('success');
    },
    onError: () => {
      setNewsletterStatus('error');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-primary-foreground/90 font-serif mb-4 lang-hi"
            >
              ॥ {t('home.heroQuote')} ॥
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-6 leading-tight ${langClass}`}
            >
              {heroSection?.title || t('home.heroTitle')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl md:text-2xl text-accent font-medium mb-4"
            >
              {heroSection?.subtitle || t('home.heroTagline')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className={`text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10 ${langClass}`}
              dangerouslySetInnerHTML={{ __html: heroSection?.content || t('home.heroDescription') }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild className="btn-hero">
                <Link to="/volunteer">
                  <Users className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('home.becomeVolunteer')}</span>
                </Link>
              </Button>
              <Button asChild className="btn-hero-outline bg-transparent">
                <Link to="/donate">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('common.donate')}</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary-foreground rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-card temple-pattern">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-primary font-serif text-lg mb-4 lang-hi">॥ {missionSection?.subtitle || t('home.missionQuote')} ॥</p>
            <h2 className={`text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 ${langClass}`}>
              {missionSection?.title || t('home.missionTitle')}
            </h2>
            <div className="spiritual-quote text-left md:text-center">
              <p className={`text-lg text-foreground/80 leading-relaxed ${langClass}`} dangerouslySetInnerHTML={{ __html: missionSection?.content || t('home.missionText') }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Durga System Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('home.durgaSystemTitle')}
            subtitle={t('home.durgaSystemSubtitle')}
            sanskritQuote={t('home.durgaQuote')}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (durgaError || pageError) ? (
            <div className="text-center py-12">
              <p className={`text-foreground/60 ${langClass}`}>{t('common.loadError')}</p>
            </div>
          ) : durgas.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-foreground/60 ${langClass}`}>No Durga content available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {durgas.map((durga, index) => (
                <DurgaCard
                  key={durga.id}
                  {...durga}
                  icon={durgaIcons[durga.id]}
                  index={index}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
              <Link to="/durga">
                <span className={langClass}>{t('home.viewAllDurga')}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Impact Counters */}
      <section className="py-20 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('home.impactTitle')}
            subtitle={t('home.impactSubtitle')}
            light
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {impactNumbers.map((item, index) => (
                <ImpactCounter key={index} {...item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('home.eventsTitle')}
            subtitle={t('home.eventsSubtitle')}
            sanskritQuote={t('home.eventsQuote')}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : eventsError ? (
            <div className="text-center py-12">
              <p className={`text-foreground/60 ${langClass}`}>Failed to load events</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <EventCard key={index} {...event} index={index} />
              ))}
            </div>
          ) : (
            <p className={`text-center text-foreground/60 ${langClass}`}>{t('events.noEvents')}</p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/events">
                <span className={langClass}>{t('home.viewAllEvents')}</span>
                <Calendar className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('home.supportersTitle')}
            subtitle={t('home.supportersSubtitle')}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <SectionTitle
              title={t('newsletter.title')}
              subtitle={t('newsletter.subtitle')}
            />
            <div className="mt-4 bg-background rounded-2xl shadow-card border border-border px-4 py-6 md:px-8 md:py-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-center">
                <div className="w-full md:max-w-xs">
                  <Input
                    type="email"
                    placeholder={t('newsletter.emailPlaceholder')}
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      setNewsletterStatus('idle');
                    }}
                  />
                </div>
                <div className="w-full md:max-w-xs">
                  <Input
                    type="text"
                    placeholder={t('newsletter.namePlaceholder')}
                    value={newsletterName}
                    onChange={(e) => {
                      setNewsletterName(e.target.value);
                      setNewsletterStatus('idle');
                    }}
                  />
                </div>
                  <Button
                  size="lg"
                  className="w-full md:w-auto rounded-full"
                  disabled={!newsletterEmail || newsletterMutation.isPending}
                  onClick={() => {
                    if (!newsletterEmail) return;
                    newsletterMutation.mutate({
                      email: newsletterEmail,
                      name: newsletterName || undefined,
                    });
                  }}
                >
                  {newsletterMutation.isPending ? 'Subscribing…' : t('newsletter.button')}
                </Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground text-center">
                {newsletterStatus === 'success'
                  ? t('newsletter.success')
                  : newsletterStatus === 'error'
                  ? t('newsletter.error')
                  : t('newsletter.hint')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gold-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className={`text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 ${langClass}`}>
              {t('home.ctaTitle')}
            </h2>
            <p className={`text-lg text-foreground/80 mb-8 ${langClass}`}>
              {t('home.ctaText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
                <Link to="/donate">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('common.donate')}</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-foreground text-foreground hover:bg-foreground hover:text-background">
                <Link to="/volunteer">
                  <Users className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('home.becomeVolunteer')}</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;