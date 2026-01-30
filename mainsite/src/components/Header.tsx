import { useState, forwardRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';
import logo from '@/assets/logo_kss.jpg';

const Header = forwardRef<HTMLElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVolunteerLoggedIn, setIsVolunteerLoggedIn] = useState(false);
  const location = useLocation();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Check volunteer login status
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('volunteerAccessToken');
      setIsVolunteerLoggedIn(!!token);
    };
    checkLogin();
    // Check periodically
    const interval = setInterval(checkLogin, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch site settings
  const { data: siteSettings, isError } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  const orgName = siteSettings?.data?.organizationName?.[language] || t('header.orgName');
  const tagline = siteSettings?.data?.tagline?.[language] || t('header.tagline');

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.durga'), path: '/durga' },
    { name: t('nav.events'), path: '/events' },
    { name: t('nav.gallery'), path: '/gallery' },
    { name: t('nav.transparency'), path: '/transparency' },
    { name: t('nav.volunteer'), path: '/volunteer' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Krushna Sada Sahayate" className="h-14 w-auto" />
            <div className="hidden sm:block">
              <h1 className={`text-lg font-serif font-bold text-foreground leading-tight ${langClass}`}>
                {orgName}
              </h1>
              <p className="text-xs text-muted-foreground">{tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm font-medium ${langClass} ${
                  location.pathname === link.path ? 'nav-link-active' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button & Language Switcher */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {/* Check if volunteer is logged in */}
            {isVolunteerLoggedIn ? (
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/volunteer/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  <span className={langClass}>Dashboard</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="rounded-full px-6">
                <Link to="/volunteer/login">
                  <span className={langClass}>Volunteer Login</span>
                </Link>
              </Button>
            )}
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              <Link to="/donate">
                <Heart className="w-4 h-4 mr-2" />
                <span className={langClass}>{t('common.donate')}</span>
              </Link>
            </Button>
          </div>

          {/* Mobile: Language Switcher & Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <nav className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 text-lg font-medium ${langClass} ${
                      location.pathname === link.path
                        ? 'text-primary'
                        : 'text-foreground hover:text-primary'
                    } transition-colors`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-4 space-y-3"
              >
                {isVolunteerLoggedIn ? (
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/volunteer/dashboard" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      <span className={langClass}>Dashboard</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="ghost" className="w-full rounded-full">
                    <Link to="/volunteer/login" onClick={() => setIsOpen(false)}>
                      <span className={langClass}>Volunteer Login</span>
                    </Link>
                  </Button>
                )}
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  <Link to="/donate" onClick={() => setIsOpen(false)}>
                    <Heart className="w-4 h-4 mr-2" />
                    <span className={langClass}>{t('common.donate')}</span>
                  </Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;