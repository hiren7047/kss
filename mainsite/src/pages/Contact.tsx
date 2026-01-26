import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

const Contact = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  // Fetch site settings
  const { data: settings, isLoading: settingsLoading, isError: settingsError } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Fetch page content
  const { data: pageContent, isError: pageError } = useQuery({
    queryKey: ['pageContent', 'contact', language],
    queryFn: () => publicApi.getPageContent('contact', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const contactInfo = settings?.data ? [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.phone'),
      value: settings.data.contactInfo?.phone || '',
      link: settings.data.contactInfo?.phone ? `tel:${settings.data.contactInfo.phone}` : '#',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t('contact.whatsapp'),
      value: settings.data.contactInfo?.whatsapp || '',
      link: settings.data.contactInfo?.whatsapp ? `https://wa.me/${settings.data.contactInfo.whatsapp.replace(/[^0-9]/g, '')}` : '#',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.email'),
      value: settings.data.contactInfo?.email || '',
      link: settings.data.contactInfo?.email ? `mailto:${settings.data.contactInfo.email}` : '#',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.address'),
      value: settings.data.contactInfo?.address?.[language] || settings.data.contactInfo?.address?.en || '',
      link: '#map',
    },
  ] : [];

  // Submit contact form
  const submitMutation = useMutation({
    mutationFn: (data: ContactFormData) => publicApi.submitContact(data),
    onSuccess: () => {
      toast.success(language === 'gu' ? 'સંદેશ મોકલાયો છે!' : language === 'hi' ? 'संदेश भेजा गया!' : 'Message sent successfully!');
      reset();
    },
    onError: () => {
      toast.error(language === 'gu' ? 'ભૂલ! કૃપા કરીને ફરી પ્રયાસ કરો.' : language === 'hi' ? 'त्रुटि! कृपया पुनः प्रयास करें।' : 'Error! Please try again.');
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');

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
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {heroSection?.title || t('contact.heroTitle')}
            </h1>
            <p className={`text-xl text-primary-foreground/80 ${langClass}`}>
              {heroSection?.subtitle || t('contact.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          {contactInfo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-xl p-6 text-center shadow-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {info.icon}
                  </div>
                  <h3 className={`font-semibold text-foreground mb-1 ${langClass}`}>{info.title}</h3>
                  <p className="text-muted-foreground text-sm">{info.value}</p>
                </motion.a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SectionTitle
                title={t('contact.sendMessage')}
                subtitle={t('contact.messageSubtitle')}
                centered={false}
              />

              <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-2xl p-8 shadow-card border border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={langClass}>{t('form.name')} {t('form.required')}</Label>
                    <Input 
                      id="name" 
                      placeholder={t('form.namePlaceholder')} 
                      required 
                      {...register('name', { required: true })}
                    />
                    {errors.name && <span className="text-sm text-destructive">Name is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={langClass}>{t('form.phone')}</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={langClass}>{t('form.email')} {t('form.required')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    {...register('email', { required: true })}
                  />
                  {errors.email && <span className="text-sm text-destructive">Email is required</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className={langClass}>{t('form.subject')}</Label>
                  <Input 
                    id="subject" 
                    placeholder={t('form.subjectPlaceholder')} 
                    {...register('subject')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className={langClass}>{t('form.message')} {t('form.required')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t('form.messagePlaceholder')}
                    rows={5}
                    required
                    {...register('message', { required: true })}
                  />
                  {errors.message && <span className="text-sm text-destructive">Message is required</span>}
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {t('contact.sendMessage')}
                </Button>
              </form>
            </motion.div>

            {/* Map & Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <SectionTitle
                  title={t('contact.locationTitle')}
                  subtitle={t('contact.locationSubtitle')}
                  centered={false}
                />
              </div>

              {/* Map */}
              <div id="map" className="bg-card rounded-2xl overflow-hidden shadow-card border border-border h-80">
                <iframe
                  src={settings?.data?.contactInfo?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d469249.9178939576!2d72.41493088671875!3d23.020161299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1704000000000!5m2!1sen!2sin'}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>

              {/* Office Hours */}
              {settings?.data?.contactInfo?.officeHours && (
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                    <h3 className={`text-lg font-semibold text-foreground ${langClass}`}>{t('contact.officeHours')}</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    {settings.data.contactInfo.officeHours.monSat && (
                      <div className="flex justify-between">
                        <span className={langClass}>{t('contact.monSat')}</span>
                        <span className="font-medium text-foreground">{settings.data.contactInfo.officeHours.monSat}</span>
                      </div>
                    )}
                    {settings.data.contactInfo.officeHours.sunday && (
                      <div className="flex justify-between">
                        <span className={langClass}>{t('contact.sunday')}</span>
                        <span className="font-medium text-foreground">{settings.data.contactInfo.officeHours.sunday}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;