import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2, AlertCircle, CheckCircle2, IndianRupee, Shield, Lock, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface EventItemForDonate {
  _id: string;
  name: string;
  description?: string;
  unitPrice: number;
  totalQuantity: number;
  donatedQuantity: number;
  totalAmount: number;
  donatedAmount: number;
  status: string;
}

export default function DonateEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EventItemForDonate | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event-donate', eventId],
    queryFn: () => publicApi.getEventById(eventId!),
    enabled: !!eventId,
  });

  const { data: itemsData } = useQuery({
    queryKey: ['event-donate-items', eventId],
    queryFn: () => publicApi.getEventDonateItems(eventId!),
    enabled: !!eventId && !!eventData?.data,
  });

  const event = eventData?.data;
  const eventItems = itemsData?.data?.items ?? [];
  const eventInfo = itemsData?.data?.event ?? event ? { _id: event._id, name: event.name } : null;

  useEffect(() => {
    if (selectedItem) {
      const remaining = selectedItem.totalQuantity - selectedItem.donatedQuantity;
      setItemQuantity(Math.max(1, Math.min(remaining, 999)));
    }
  }, [selectedItem]);

  const handleQuickAmount = (amt: number) => {
    setAmount(String(amt));
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    if (value && !isNaN(Number(value)) && Number(value) > 0) setAmount(value);
  };

  const handleDonate = async () => {
    if (!eventId || !eventInfo) return;
    const isItemDonation = !!selectedItem;
    const amt = isItemDonation ? selectedItem!.unitPrice * itemQuantity : Number(amount);
    if (!amt || amt < 1) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!isAnonymous && !donorName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (isItemDonation) {
      const remaining = selectedItem!.totalQuantity - selectedItem!.donatedQuantity;
      if (itemQuantity < 1 || itemQuantity > remaining) {
        toast.error(`Quantity must be between 1 and ${remaining}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Payment gateway could not be loaded. Please check your connection and try again.');
        setSubmitting(false);
        return;
      }

      // Razorpay receipt max 40 chars. Use short prefix + timestamp.
      const receiptNumber = `ev_${String(eventId).slice(-8)}_${Date.now()}`.slice(0, 40);
      let orderRes: { success?: boolean; data?: { keyId?: string; orderId?: string; amount?: number; currency?: string } };
      try {
        orderRes = await publicApi.createDonationOrder({
          amount: amt,
          receiptNumber,
          notes: {
            purpose: 'event',
            eventId,
            ...(isItemDonation && { eventItemId: selectedItem!._id }),
          },
        });
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
        toast.error(msg || 'Could not create payment order. Please try again.');
        setSubmitting(false);
        return;
      }

      if (!orderRes?.success || !orderRes?.data?.keyId || !orderRes?.data?.orderId) {
        toast.error('Payment is not available. Please try again later.');
        setSubmitting(false);
        return;
      }

      const verifyPayload = {
        donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
        amount: amt,
        purpose: 'event' as const,
        eventId,
        isAnonymous,
        ...(isItemDonation && {
          eventItemId: selectedItem!._id,
          itemQuantity,
          donationType: 'item_specific' as const,
        }),
      };

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency || 'INR',
        name: 'Krishna Sada Sahayate',
        description: isItemDonation
          ? `Donation for ${selectedItem!.name} - ${eventInfo.name}`
          : `Donation for ${eventInfo.name}`,
        order_id: orderRes.data.orderId,
        handler: async (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await publicApi.verifyDonationPayment({
              donationData: verifyPayload,
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
            });
            setSuccess(true);
            toast.success('Thank you! Your donation was successful.');
          } catch {
            toast.error('Payment verification failed. Please contact us.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };

      const Razorpay = (window as any).Razorpay;
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      toast.error('Failed to open payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Invalid link
              </CardTitle>
              <CardDescription>Event not specified.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/events')} className="w-full">
                {t('events.backToEvents')}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-4">
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
                {t('events.backToEvents')}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const title = event.translations?.[language]?.title || event.translations?.en?.title || event.name || 'Event';

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-success/5 via-background to-primary/5 p-4 py-12">
          <Card className="w-full max-w-lg shadow-2xl border-2 border-success/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold text-success">Thank You for Your Generosity!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your donation for {title} has been received. Krishna Sada Sahayate appreciates your support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment processed via Razorpay</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/events/${eventId}`)} variant="outline" className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Button>
                <Button onClick={() => navigate('/donate')} className="flex-1">
                  {t('common.donate')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5 p-4 py-12">
        <Card className="w-full max-w-2xl shadow-2xl border-2 relative">
          <CardHeader className="text-center space-y-4 pb-6">
            <Button variant="ghost" className="absolute top-4 left-4 z-10" onClick={() => navigate(`/events/${eventId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('events.backToEvents')}
            </Button>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-primary/20 ring-4 ring-success/10">
              <Heart className="h-10 w-10 text-success fill-success" />
            </div>
            <div className="space-y-2">
              <CardTitle className={`text-3xl font-bold ${langClass}`}>
                {t('events.donateNow')} – {title}
              </CardTitle>
              <CardDescription className={langClass}>
                {t('events.donationNote')}
              </CardDescription>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span>Event:</span>
                <span className="font-semibold">{title}</span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* 1. Item-based OR general amount */}
            {eventInfo && eventItems.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className={`text-sm font-semibold text-foreground ${langClass}`}>
                    Choose how to donate
                  </p>
                  <p className={`text-xs text-muted-foreground mt-1 ${langClass}`}>
                    Donate for specific items below, or give a general amount for this event.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className={`text-sm font-semibold ${langClass}`}>Donate towards a specific item</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {eventItems.map((item) => {
                      const remaining = item.totalQuantity - (item.donatedQuantity ?? 0);
                      const totalAmt = item.totalAmount ?? item.unitPrice * item.totalQuantity;
                      const donatedAmt = item.donatedAmount ?? 0;
                      const pct = totalAmt > 0 ? (donatedAmt / totalAmt) * 100 : 0;
                      const isSelected = selectedItem?._id === item._id;
                      return (
                        <div
                          key={item._id}
                          role="button"
                          tabIndex={0}
                          className={`rounded-xl border-2 p-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                            isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedItem(isSelected ? null : item)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(isSelected ? null : item)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={`font-semibold truncate ${langClass}`}>{item.name}</p>
                              {item.description && (
                                <p className={`text-xs text-muted-foreground mt-0.5 line-clamp-2 ${langClass}`}>{item.description}</p>
                              )}
                              <p className={`text-xs text-muted-foreground mt-1 ${langClass}`}>
                                ₹{item.unitPrice.toLocaleString('en-IN')} per unit · {remaining} left
                              </p>
                              <Progress value={Math.min(100, pct)} className="h-1.5 mt-2" />
                            </div>
                            <Button
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              className="shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(isSelected ? null : item);
                              }}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedItem && (
                    <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${langClass}`}>Donating for: {selectedItem.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                          Change
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            max={Math.max(1, (selectedItem.totalQuantity ?? 0) - (selectedItem.donatedQuantity ?? 0))}
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-24"
                          />
                        </div>
                        <div className={`text-sm font-medium text-success ${langClass}`}>
                          = ₹{(selectedItem.unitPrice * itemQuantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {!selectedItem && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className={`text-xs text-muted-foreground ${langClass}`}>or</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <p className={`text-sm font-semibold ${langClass}`}>Give a general amount</p>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className={`text-sm font-semibold ${langClass}`}>Donation amount</p>
                <p className={`text-xs text-muted-foreground mt-1 ${langClass}`}>
                  Enter the amount you wish to donate for this event.
                </p>
              </div>
            )}

            {/* 2. Your details */}
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-success focus:ring-success"
              />
              <Label htmlFor="anon" className="text-sm font-medium cursor-pointer flex-1">
                Donate anonymously
              </Label>
            </div>

            {!isAnonymous && (
              <div className="grid gap-2">
                <Label htmlFor="donorName" className="text-sm font-semibold">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="donorName"
                  placeholder="Enter your full name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            )}

            {!selectedItem && (
              <div className="space-y-4">
                <Label className={`text-sm font-semibold ${langClass}`}>
                  Donation Amount <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {QUICK_AMOUNTS.map((amt) => {
                    const isSelected = amount === String(amt);
                    return (
                      <Button
                        key={amt}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-12 font-semibold transition-all ${
                          isSelected
                            ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-md ring-2 ring-orange-400/50'
                            : 'border-border hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700'
                        }`}
                        onClick={() => handleQuickAmount(amt)}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </Button>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Or enter custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    className="h-12 pl-10 text-base font-medium"
                  />
                </div>
              </div>
            )}

            {((!selectedItem && amount && Number(amount) > 0) || (selectedItem && selectedItem.unitPrice * itemQuantity > 0)) && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium text-muted-foreground ${langClass}`}>Your Donation:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{(selectedItem ? selectedItem.unitPrice * itemQuantity : Number(amount)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            <Button
              className={`w-full h-12 gap-2 text-base font-semibold shadow-lg ${
                submitting || (selectedItem ? selectedItem.unitPrice * itemQuantity < 1 : !amount || Number(amount) < 1)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              onClick={handleDonate}
              disabled={submitting || (selectedItem ? selectedItem.unitPrice * itemQuantity < 1 : !amount || Number(amount) < 1)}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  {selectedItem ? (
                    <>Donate ₹{(selectedItem.unitPrice * itemQuantity).toLocaleString('en-IN')} for {selectedItem.name}</>
                  ) : (
                    <>Donate ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'}</>
                  )}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure payment powered by Razorpay</span>
              <Shield className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
