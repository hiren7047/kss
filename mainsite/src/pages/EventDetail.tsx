import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => publicApi.getEventById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const event = eventData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Event not found
              </CardTitle>
              <CardDescription>This event may have been removed or is not available.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/events')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const mainsiteDisplay = event.mainsiteDisplay || {};
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate || event.startDate);
  const isPast = endDate < new Date();

  const title = event.translations?.[language]?.title || event.translations?.en?.title || event.name || 'Event';
  const description = mainsiteDisplay.longDescription ||
    mainsiteDisplay.shortDescription ||
    event.translations?.[language]?.description ||
    event.translations?.en?.description ||
    event.description ||
    '';

  const location = mainsiteDisplay.location?.name ||
    mainsiteDisplay.location?.address ||
    event.location ||
    '';

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

  const dateFormat = language === 'gu' ? 'dd MMM, yyyy' : language === 'hi' ? 'dd MMM, yyyy' : 'MMM dd, yyyy';
  const dateDisplay = startDate.toDateString() === endDate.toDateString()
    ? format(startDate, dateFormat)
    : `${format(startDate, dateFormat)} - ${format(endDate, dateFormat)}`;

  const timeDisplay = mainsiteDisplay.time || format(startDate, 'h:mm a');

  const getStatusBadge = () => {
    if (!event.status) return null;
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      planned: { label: t('events.status.planned') || 'Planned', variant: 'outline' },
      ongoing: { label: t('events.status.ongoing') || 'Ongoing', variant: 'default' },
      completed: { label: t('events.status.completed') || 'Completed', variant: 'secondary' },
      cancelled: { label: t('events.status.cancelled') || 'Cancelled', variant: 'destructive' },
    };
    const statusInfo = statusMap[event.status] || statusMap.planned;
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/events')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('events.backToEvents')}
            </Button>

            {imageUrl && (
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-6 shadow-2xl">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge()}
                </div>
              </div>
            )}

            <div className="text-center space-y-4">
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground ${langClass}`}>
                {title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground/80">
                {dateDisplay && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className={langClass}>{dateDisplay}</span>
                  </div>
                )}
                {timeDisplay && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className={langClass}>{timeDisplay}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className={`truncate ${langClass}`}>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      {description && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <p className={`text-lg text-foreground/80 leading-relaxed ${langClass}`}>
                {description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Donation CTA – event-based donate (not random); always show for non-past events */}
      {!isPast && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-primary/20">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${langClass}`}>
                  <Heart className="h-5 w-5 text-primary" />
                  {t('events.supportEvent')}
                </CardTitle>
                <CardDescription className={langClass}>
                  {t('events.supportDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.targetAmount > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`text-muted-foreground ${langClass}`}>Target</span>
                        <span className="font-semibold">₹{event.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => navigate(`/donate/event/${id}`)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {t('events.donateNow')}
                  </Button>
                  <p className={`text-xs text-center text-muted-foreground ${langClass}`}>
                    {t('events.donationNote')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;
