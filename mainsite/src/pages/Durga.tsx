import { motion } from 'framer-motion';
import { BookOpen, Utensils, Droplets, HeartPulse, Coins, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import DurgaCard from '@/components/DurgaCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';
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

const Durga = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Fetch page content
  const { data: pageContent, isError: pageError } = useQuery({
    queryKey: ['pageContent', 'durga', language],
    queryFn: () => publicApi.getPageContent('durga', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch Durga content
  const { data: durgaData, isLoading, isError: durgaError } = useQuery({
    queryKey: ['durgaContent'],
    queryFn: () => publicApi.getDurgaContent(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');

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
              ॥ {t('durga.heroQuote')} ॥
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {t('durga.heroTitle')}
            </h1>
            <p className={`text-xl text-primary-foreground/80 max-w-2xl mx-auto ${langClass}`}>
              {t('durga.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Explanation */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="spiritual-quote text-center">
              <p className={`text-lg text-foreground/80 leading-relaxed ${langClass}`} dangerouslySetInnerHTML={{ __html: heroSection?.content || t('durga.explanation') }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Durgas */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('durga.allDurgaTitle')}
            subtitle={t('durga.allDurgaSubtitle')}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        </div>
      </section>

      {/* Future Durgas */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h3 className={`text-2xl font-serif font-bold text-foreground mb-4 ${langClass}`}>
              {t('durga.futureDurgaTitle')}
            </h3>
            <p className={`text-muted-foreground mb-6 ${langClass}`}>
              {t('durga.futureDurgaText')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: t('durga.futureDurgas.environment'), coming: t('durga.futureDurgas.comingSoon') },
                { name: t('durga.futureDurgas.health'), coming: t('durga.futureDurgas.comingSoon') },
                { name: t('durga.futureDurgas.elderly'), coming: t('durga.futureDurgas.comingSoon') },
              ].map((item) => (
                <span
                  key={item.name}
                  className={`bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium ${langClass}`}
                >
                  {item.name} ({item.coming})
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Durga;