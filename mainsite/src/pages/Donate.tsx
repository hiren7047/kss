import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, CreditCard, Building, Smartphone, Shield, Loader2, X, Link2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';
import { DonationForm } from '@/components/DonationForm';

const Donate = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  const navigate = useNavigate();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(undefined);

  // Fetch page content
  const { data: pageContent, isError: pageError } = useQuery({
    queryKey: ['pageContent', 'donate', language],
    queryFn: () => publicApi.getPageContent('donate', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch site settings
  const { data: siteSettings, isError: settingsError } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Fetch Durga content
  const { data: durgaData, isError: durgaError } = useQuery({
    queryKey: ['durgaContent'],
    queryFn: () => publicApi.getDurgaContent(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');
  const transparencySection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'transparency');
  
  // Use CMS content if available, otherwise fallback to translations
  const heroTitle = heroSection?.title || t('donate.heroTitle');
  const heroSubtitle = heroSection?.subtitle || t('donate.heroSubtitle');
  const heroQuote = heroSection?.content || t('donate.heroQuote');

  const transparencyPoints = [
    t('donate.transparencyPoints.receipt'),
    t('donate.transparencyPoints.taxBenefit'),
    t('donate.transparencyPoints.monthlyReport'),
    t('donate.transparencyPoints.updates'),
    t('donate.transparencyPoints.registered'),
  ];

  // Get admin-managed donation amounts from site settings
  const donationAmounts = siteSettings?.data?.donationAmounts || [500, 1000, 2500, 5000, 10000, 25000];

  // Transform durgas and fetch their donation links
  const durgas = durgaData?.data?.map((durga: any) => ({
    id: durga.durgaId,
    name: durga.name,
    nameGujarati: durga.nameGujarati || durga.name,
    meaning: durga.meaning || '',
    image: durga.imageUrl || '',
  })) || [];

  const paymentInfo = siteSettings?.data?.paymentInfo || {};

  // Handle Durga donation click
  const handleDurgaDonation = async (durgaId: string) => {
    try {
      const linkData = await publicApi.getDurgaDonationLink(durgaId);
      if (linkData?.data?.slug) {
        navigate(`/donate/${linkData.data.slug}`);
      } else {
        // If no link exists, open general donation form
        setShowDonationForm(true);
      }
    } catch (error) {
      // If Durga link doesn't exist, open general donation form
      setShowDonationForm(true);
    }
  };

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
            {heroQuote && (
              <p className="text-primary-foreground/80 font-serif text-lg mb-4 lang-hi">
                ॥ {heroQuote} ॥
              </p>
            )}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {heroTitle}
            </h1>
            <p className={`text-xl text-primary-foreground/80 max-w-2xl mx-auto ${langClass}`}>
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emotional Appeal */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="spiritual-quote text-center">
              <p className={`text-lg text-foreground/80 leading-relaxed ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                "{t('donate.emotionalAppeal')}"
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donation Options */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('donate.optionsTitle')}
            subtitle={t('donate.optionsSubtitle')}
          />

          {/* Amount Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h3 className={`text-xl font-semibold text-center mb-6 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
              {t('donate.selectAmount')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {donationAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setSelectedAmount(amount);
                    setShowDonationForm(true);
                  }}
                  className="rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  ₹{amount.toLocaleString('en-IN')}
                </Button>
              ))}
            </div>
            <p className={`text-center text-muted-foreground mt-4 text-sm ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
              {t('donate.anyAmount')}
            </p>
          </motion.div>

          {/* Durga-wise Donation */}
          <div className="max-w-4xl mx-auto">
            <h3 className={`text-xl font-semibold text-center mb-6 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
              {t('donate.durgaWise')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {durgas.map((durga, index) => (
                <motion.div
                  key={durga.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => handleDurgaDonation(durga.id)}
                  className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={durga.image}
                      alt={durga.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold text-foreground group-hover:text-primary transition-colors ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                        {t(`durgas.${durga.id}.nameGujarati`)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t(`durgas.${durga.id}.meaning`)}</p>
                    </div>
                    <Heart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('donate.howToDonate')}
            subtitle={t('donate.paymentOptions')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 text-center shadow-card border border-border"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('donate.upi')}</h3>
              <p className={`text-muted-foreground text-sm mb-4 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                {t('donate.upiDesc')}
              </p>
              <code className="bg-muted px-3 py-1 rounded text-sm">{paymentInfo.upiId || 'kss@upi'}</code>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 text-center shadow-card border border-border"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-accent" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                {t('donate.bankTransfer')}
              </h3>
              <p className={`text-muted-foreground text-sm mb-4 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                {t('donate.bankTransferDesc')}
              </p>
              <p className="text-sm text-muted-foreground">
                {paymentInfo.bankAccount && `A/c: ${paymentInfo.bankAccount}`}
                {paymentInfo.bankAccount && paymentInfo.ifscCode && <br />}
                {paymentInfo.ifscCode && `IFSC: ${paymentInfo.ifscCode}`}
                {!paymentInfo.bankAccount && !paymentInfo.ifscCode && 'Contact us for bank details'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 text-center shadow-card border border-border"
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-destructive" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                {t('donate.card')}
              </h3>
              <p className={`text-muted-foreground text-sm mb-4 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                {t('donate.cardDesc')}
              </p>
              <Button 
                className="rounded-full"
                onClick={() => {
                  setSelectedAmount(undefined);
                  setShowDonationForm(true);
                }}
              >
                {t('donate.onlineDonate')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="w-12 h-12 text-primary" />
                <div>
                  <h3 className={`text-2xl font-serif font-bold text-foreground ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                    {t('donate.transparency')}
                  </h3>
                  <p className={`text-muted-foreground ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                    {t('donate.transparencySubtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {transparencyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className={`text-foreground/80 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-3xl font-serif font-bold text-foreground mb-4 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
              {t('donate.ctaTitle')}
            </h2>
            <p className={`text-foreground/80 mb-8 ${language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : ''}`}>
              {t('donate.ctaText')}
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-6 text-lg"
              onClick={() => {
                setSelectedAmount(undefined);
                setShowDonationForm(true);
              }}
            >
              <Heart className="w-6 h-6 mr-2" />
              {t('donate.donateNow')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Donation Form Modal */}
      <AnimatePresence>
        {showDonationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowDonationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <DonationForm
                defaultAmount={selectedAmount}
                onClose={() => setShowDonationForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Donate;