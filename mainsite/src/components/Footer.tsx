import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, MessageCircle, Send, Linkedin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';
import logo from '@/assets/logo_kss.jpg';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Fetch site settings
  const { data: siteSettings, isError } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const orgName = siteSettings?.data?.organizationName?.[language] || t('header.orgName');
  const tagline = siteSettings?.data?.tagline?.[language] || t('header.tagline');
  const contactInfo = siteSettings?.data?.contactInfo || {};
  const socialMedia = siteSettings?.data?.socialMedia || {};
  const address = contactInfo.address?.[language] || t('footer.location');
  const phone = contactInfo.phone || '';
  const email = contactInfo.email || '';
  const officeHours = contactInfo.officeHours || {};

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.durga'), path: '/durga' },
    { name: t('nav.events'), path: '/events' },
    { name: t('nav.gallery'), path: '/gallery' },
    { name: t('nav.transparency'), path: '/transparency' },
  ];

  const sevaList = [
    t('footer.sevaList.saraswati'),
    t('footer.sevaList.annapurna'),
    t('footer.sevaList.ganga'),
    t('footer.sevaList.kali'),
    t('footer.sevaList.lakshmi'),
  ];

  return (
    <footer ref={ref} className="bg-foreground text-background">
      {/* Spiritual Quote */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg md:text-xl font-serif text-primary-foreground italic lang-hi">
            "{t('footer.quote')}"
          </p>
          <p className="text-sm text-primary-foreground/80 mt-2 lang-hi">
            {t('footer.quoteSource')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="KSS Logo" className="h-16 w-auto bg-background rounded-lg p-1" />
              <div>
                <h3 className={`text-lg font-serif font-bold ${langClass}`}>{orgName}</h3>
                <p className="text-xs text-background/70">{tagline}</p>
              </div>
            </div>
            <p className={`text-sm text-background/80 leading-relaxed ${langClass}`}>
              {t('footer.description')}
            </p>
            <div className="flex gap-4 flex-wrap">
              {socialMedia.facebook && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
              )}
              {socialMedia.youtube && (
                <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="Youtube">
                  <Youtube size={20} />
                </a>
              )}
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
              )}
              {socialMedia.whatsappCommunity && (
                <a href={socialMedia.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="WhatsApp Community">
                  <MessageCircle size={20} />
                </a>
              )}
              {socialMedia.telegram && (
                <a href={socialMedia.telegram} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="Telegram">
                  <Send size={20} />
                </a>
              )}
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-accent transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-serif font-semibold mb-4 text-accent ${langClass}`}>{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm text-background/70 hover:text-accent transition-colors ${langClass}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Seva */}
          <div>
            <h4 className={`text-lg font-serif font-semibold mb-4 text-accent ${langClass}`}>{t('footer.ourSeva')}</h4>
            <ul className="space-y-2">
              {sevaList.map((seva) => (
                <li key={seva}>
                  <span className={`text-sm text-background/70 ${langClass}`}>{seva}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={`text-lg font-serif font-semibold mb-4 text-accent ${langClass}`}>{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <span className={`text-sm text-background/70 ${langClass}`}>
                  {address}
                </span>
              </li>
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-accent flex-shrink-0" />
                  <a href={`tel:${phone}`} className="text-sm text-background/70 hover:text-accent transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-accent flex-shrink-0" />
                  <a href={`mailto:${email}`} className="text-sm text-background/70 hover:text-accent transition-colors">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60 ${langClass}`}>
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.registeredTrust')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;