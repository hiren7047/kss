import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  // Fetch page content
  const { data: pageContent, isError: pageError } = useQuery({
    queryKey: ['pageContent', 'gallery', language],
    queryFn: () => publicApi.getPageContent('gallery', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch gallery items
  const { data: galleryData, isLoading, isError: galleryError } = useQuery({
    queryKey: ['gallery', activeCategory, activeTab],
    queryFn: () => publicApi.getGallery({
      category: activeCategory === 'all' ? undefined : activeCategory,
      type: activeTab === 'photos' ? 'photo' : 'video',
    }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');

  const categories = [
    { key: 'all', label: t('gallery.categories.all') },
    { key: 'annapurna', label: t('gallery.categories.annapurna') },
    { key: 'ganga', label: t('gallery.categories.ganga') },
    { key: 'kali', label: t('gallery.categories.kali') },
    { key: 'saraswati', label: t('gallery.categories.saraswati') },
    { key: 'events', label: t('gallery.categories.events') },
  ];

  const galleryItems = galleryData?.data || [];
  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter((item: any) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>{heroSection?.title || t('gallery.heroTitle')}</h1>
            <p className={`text-xl text-primary-foreground/80 ${langClass}`}>{heroSection?.subtitle || t('gallery.heroSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 bg-card border-b border-border sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button variant={activeTab === 'photos' ? 'default' : 'outline'} onClick={() => setActiveTab('photos')} className="rounded-full">
                <Image className="w-4 h-4 mr-2" />
                <span className={langClass}>{t('common.photos')}</span>
              </Button>
              <Button variant={activeTab === 'videos' ? 'default' : 'outline'} onClick={() => setActiveTab('videos')} className="rounded-full">
                <Video className="w-4 h-4 mr-2" />
                <span className={langClass}>{t('common.videos')}</span>
              </Button>
            </div>
            {activeTab === 'photos' && (
              <div className="flex gap-2 flex-wrap justify-center">
                {categories.map((cat) => (
                  <Button 
                    key={cat.key} 
                    variant={activeCategory === cat.key ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveCategory(cat.key)} 
                    className={`rounded-full text-sm ${langClass}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item: any, index: number) => (
                <motion.div 
                  key={item._id || index} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: index * 0.05 }} 
                  viewport={{ once: true }} 
                  className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square" 
                  onClick={() => setSelectedImage(item)}
                >
                  <img 
                    src={item.thumbnailUrl || item.fileUrl} 
                    alt={item.title || item.description || ''} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-primary-foreground text-sm font-medium">{item.title || item.description || ''}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={`text-center text-foreground/60 py-12 ${langClass}`}>No items found</p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-primary-foreground hover:text-primary transition-colors" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              src={selectedImage.fileUrl || selectedImage.thumbnailUrl} 
              alt={selectedImage.title || selectedImage.description || ''} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg" 
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;