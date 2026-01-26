import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import ImpactCounter from '@/components/ImpactCounter';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';

const DurgaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Fetch Durga content
  const { data: durgaData, isLoading, isError } = useQuery({
    queryKey: ['durgaContent', id],
    queryFn: () => publicApi.getDurgaContent(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    retry: 1,
  });

  const durga = durgaData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!durga) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className={`text-4xl font-serif font-bold text-foreground mb-4 ${langClass}`}>
            {t('durga.notFound')}
          </h1>
          <Button asChild>
            <Link to="/durga">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className={langClass}>{t('common.goBack')}</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get translated content
  const translatedName = language === 'gu' ? (durga.nameGujarati || durga.name) : durga.name;
  const translatedEnName = durga.name;
  const translatedMeaning = language === 'gu' ? (durga.meaningGujarati || durga.meaning) : durga.meaning;
  const translatedDescriptionLong = durga.descriptionLong || durga.description || '';

  // Default images fallback
  const defaultImages: Record<string, string> = {
    saraswati: saraswatiImg,
    annapurna: annapurnaImg,
    ganga: gangaImg,
    kali: kaliImg,
    lakshmi: lakshmiImg,
  };

  const durgaImage = durga.imageUrl || defaultImages[durga.durgaId] || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-90"
          style={{ background: durga.color || 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(35, 80%, 45%) 100%)' }}
        />
        <div className="absolute inset-0 bg-foreground/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Button
            asChild
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/20 mb-6"
          >
            <Link to="/durga">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className={langClass}>{t('durga.allDurgas')}</span>
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <p className={`text-primary-foreground/80 font-serif text-lg mb-4 ${langClass}`}>
                {translatedMeaning}
              </p>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4 ${langClass}`}>
                {translatedName}
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-6">
                {translatedEnName}
              </p>
              <p className={`text-primary-foreground/90 text-lg leading-relaxed mb-8 ${langClass}`} dangerouslySetInnerHTML={{ __html: translatedDescriptionLong }} />
              <Button asChild size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 rounded-full px-8">
                <Link to="/donate">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('durga.donateForDurga')}</span>
                </Link>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <img
                src={durgaImage}
                alt={durga.name}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (defaultImages[durga.durgaId]) {
                    target.src = defaultImages[durga.durgaId];
                  }
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('durga.activitiesTitle')}
            subtitle={t('durga.activitiesSubtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {(durga.activitiesDetailed || durga.activities || []).map((activity: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 shadow-card border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold text-foreground mb-2 ${langClass}`}>
                      {typeof activity === 'string' ? activity : activity.name}
                    </h3>
                    {typeof activity === 'object' && activity.description && (
                      <p className={`text-muted-foreground text-sm ${langClass}`}>
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('durga.impactTitle')}
            subtitle={t('durga.impactSubtitle')}
          />

          {durga.impactNumbers && durga.impactNumbers.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {durga.impactNumbers.map((item: any, index: number) => (
                <ImpactCounter
                  key={index}
                  end={item.value || 0}
                  suffix={item.suffix || '+'}
                  label={item.label || ''}
                  icon={<Heart className="w-10 h-10" />}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: durga.color || 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(35, 80%, 45%) 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-3xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {translatedName} {t('durga.supportDurga')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 rounded-full px-8">
                <Link to="/donate">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className={langClass}>{t('common.donate')}</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20 rounded-full px-8">
                <Link to="/volunteer">
                  <span className={langClass}>{t('common.volunteer')}</span>
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

export default DurgaDetail;