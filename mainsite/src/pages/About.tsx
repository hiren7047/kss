import { motion } from 'framer-motion';
import { Heart, Target, Eye, Users, Award, Shield, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';
import logo from '@/assets/logo_kss.jpg';

const About = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Fetch page content
  const { data: pageContent, isLoading, isError } = useQuery({
    queryKey: ['pageContent', 'about', language],
    queryFn: () => publicApi.getPageContent('about', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');
  const meaningSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'meaning');
  const visionSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'vision');
  const missionSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'mission');

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: t('about.values.compassion'),
      description: t('about.values.compassionDesc'),
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('about.values.transparency'),
      description: t('about.values.transparencyDesc'),
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('about.values.community'),
      description: t('about.values.communityDesc'),
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t('about.values.dharma'),
      description: t('about.values.dharmaDesc'),
    },
  ];

  const team = [
    { name: t('about.team.founder'), role: t('about.team.founderRole'), description: t('about.team.founderDesc') },
    { name: t('about.team.secretary'), role: t('about.team.secretaryRole'), description: t('about.team.secretaryDesc') },
    { name: t('about.team.coordinator'), role: t('about.team.coordinatorRole'), description: t('about.team.coordinatorDesc') },
  ];

  const whyDifferent = [
    t('about.whyDifferent.point1'),
    t('about.whyDifferent.point2'),
    t('about.whyDifferent.point3'),
    t('about.whyDifferent.point4'),
    t('about.whyDifferent.point5'),
  ];

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
              ॥ {t('about.heroQuote')} ॥
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {heroSection?.title || t('about.heroTitle')}
            </h1>
            <p className={`text-xl text-primary-foreground/80 ${langClass}`}>
              {heroSection?.subtitle || t('about.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src={logo}
                alt="KSS Logo"
                className="w-full max-w-md mx-auto rounded-2xl shadow-divine"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className={`text-3xl md:text-4xl font-serif font-bold text-foreground ${langClass}`}>
                {meaningSection?.title || t('about.meaningTitle')}
              </h2>
              {meaningSection?.content && (
                <div className="spiritual-quote">
                  <p className={`text-lg text-foreground/80 leading-relaxed ${langClass}`} dangerouslySetInnerHTML={{ __html: meaningSection.content }} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className={`text-2xl font-serif font-bold text-foreground mb-4 ${langClass}`}>
                {visionSection?.title || t('about.visionTitle')}
              </h3>
              <p className={`text-foreground/80 leading-relaxed ${langClass}`} dangerouslySetInnerHTML={{ __html: visionSection?.content || t('about.visionText') }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <h3 className={`text-2xl font-serif font-bold text-foreground mb-4 ${langClass}`}>
                {missionSection?.title || t('about.missionTitle')}
              </h3>
              <p className={`text-foreground/80 leading-relaxed ${langClass}`} dangerouslySetInnerHTML={{ __html: missionSection?.content || t('about.missionText') }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('about.valuesTitle')}
            subtitle={t('about.valuesSubtitle')}
            sanskritQuote={t('about.valuesQuote')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-6 text-center shadow-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {value.icon}
                </div>
                <h3 className={`text-xl font-serif font-bold text-foreground mb-2 ${langClass}`}>
                  {value.title}
                </h3>
                <p className={`text-muted-foreground text-sm ${langClass}`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('about.teamTitle')}
            subtitle={t('about.teamSubtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 text-center shadow-card border border-border"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-serif font-bold text-primary">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className={`text-xl font-serif font-bold text-foreground mb-1 ${langClass}`}>
                  {member.name}
                </h3>
                <p className={`text-primary font-medium text-sm mb-3 ${langClass}`}>{member.role}</p>
                <p className={`text-muted-foreground text-sm ${langClass}`}>{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-20 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className={`text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {t('about.whyDifferentTitle')}
            </h2>
            <div className="space-y-4 text-left">
              {whyDifferent.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-3"
                >
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className={`text-primary-foreground ${langClass}`}>{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;