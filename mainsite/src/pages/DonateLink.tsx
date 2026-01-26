import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Loader2, AlertCircle, CheckCircle2, IndianRupee, Shield, Lock, Package } from 'lucide-react';
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
    if (typeof window !== 'undefined' && window.Razorpay) {
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

const PURPOSE_LABELS: Record<string, string> = {
  event: 'Event',
  general: 'General Fund',
  emergency: 'Emergency Fund',
};

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

export default function DonateLink() {
  const { slug } = useParams<{ slug: string }>();
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['donation-link', slug],
    queryFn: () => publicApi.getDonationLinkBySlug(slug!),
    enabled: !!slug,
  });

  const { data: eventItemsData } = useQuery({
    queryKey: ['donation-link-event-items', slug],
    queryFn: () => publicApi.getDonationLinkEventItems(slug!),
    enabled: !!slug && !!data?.data?.eventId,
  });

  const link = data?.data;
  const eventItems = eventItemsData?.data?.items ?? [];
  const event = eventItemsData?.data?.event ?? null;

  useEffect(() => {
    if (link?.suggestedAmount && !selectedItem) {
      setAmount(String(link.suggestedAmount));
    }
  }, [link?.suggestedAmount, selectedItem]);

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
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      setAmount(value);
    }
  };

  const handleDonate = async () => {
    if (!link || !slug) return;
    const isItemDonation = !!selectedItem;
    const amt = isItemDonation
      ? selectedItem!.unitPrice * itemQuantity
      : Number(amount);
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
      await loadRazorpayScript();
      // Razorpay receipt max 40 chars. Use short prefix + slug + timestamp.
      const shortSlug = String(slug).slice(0, 12);
      const receiptNumber = `dl_${shortSlug}_${Date.now()}`.slice(0, 40);
      const orderRes = await publicApi.createDonationOrder({
        amount: amt,
        receiptNumber,
        notes: {
          purpose: isItemDonation ? 'event' : link.purpose,
          slug,
          eventId: link.eventId?._id || '',
          ...(isItemDonation && { eventItemId: selectedItem!._id }),
        },
      });

      if (!orderRes.success || !orderRes.data?.keyId) {
        toast.error('Payment is not available. Please try again later.');
        setSubmitting(false);
        return;
      }

      const verifyPayload = {
        donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
        amount: amt,
        purpose: (isItemDonation ? 'event' : link.purpose) as 'event' | 'general' | 'emergency',
        eventId: link.eventId?._id,
        isAnonymous,
        donationLinkSlug: slug,
        ...(isItemDonation && {
          eventItemId: selectedItem!._id,
          itemQuantity,
          donationType: 'item_specific' as const,
        }),
      };

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Krishna Sada Sahayate',
        description:
          isItemDonation
            ? `Donation for ${selectedItem!.name} - ${link.eventId?.name ?? 'Event'}`
            : link.title || `Donation - ${PURPOSE_LABELS[link.purpose]}`,
        order_id: orderRes.data.orderId,
        handler: async (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
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

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Failed to open payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (!slug) {
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
              <CardDescription>
                This donation link is invalid or missing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/donate')} className="w-full">
                Go to Donate Page
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
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

  if (error || !link) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Link not found
              </CardTitle>
              <CardDescription>
                This donation link may have expired or been deactivated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/donate')} className="w-full">
                Go to Donate Page
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
              <CardTitle className="text-2xl font-bold text-success">
                Thank You for Your Generosity!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Your donation has been successfully received. Krishna Sada Sahayate deeply appreciates your support and contribution towards making a difference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your contribution helps us</p>
                <p className="text-lg font-semibold text-foreground">Continue Our Mission</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment processed via Razorpay</span>
              </div>
              <Button onClick={() => navigate('/donate')} className="w-full">
                Return to Donate Page
              </Button>
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
        <Card className="w-full max-w-2xl shadow-2xl border-2">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-primary/20 ring-4 ring-success/10">
              <Heart className="h-10 w-10 text-success fill-success" />
            </div>
            <div className="space-y-2">
              <CardTitle className={`text-3xl font-bold ${langClass}`}>
                {link.title || 'Support Our Cause'}
              </CardTitle>
              <CardDescription className={`text-base ${langClass}`}>
                {link.description ||
                  `Donate towards ${PURPOSE_LABELS[link.purpose]}. Your contribution helps us make a difference in the lives of many.`}
              </CardDescription>
              {link.eventId?.name && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <span>For:</span>
                  <span className="font-semibold">{link.eventId.name}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Item-based donation (event with items) */}
            {event && eventItems.length > 0 && (
              <>
                <div className="space-y-3">
                  <p className={`text-sm font-semibold ${langClass}`}>Donate towards a specific item</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {eventItems.map((item) => {
                      const remaining = item.totalQuantity - item.donatedQuantity;
                      const pct = item.totalAmount > 0 ? (item.donatedAmount / item.totalAmount) * 100 : 0;
                      const isSelected = selectedItem?._id === item._id;
                      return (
                        <div
                          key={item._id}
                          className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedItem(isSelected ? null : item)}
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
                            max={Math.max(1, selectedItem.totalQuantity - selectedItem.donatedQuantity)}
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-24"
                          />
                        </div>
                        <div className={`text-sm text-muted-foreground ${langClass}`}>
                          = ₹{(selectedItem.unitPrice * itemQuantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
                <p className={`text-sm text-muted-foreground ${langClass}`}>
                  {selectedItem ? 'Complete payment below for your selected item.' : 'Or give a general amount for this event.'}
                </p>
              </>
            )}

            {/* Anonymous Donation Toggle */}
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

            {/* Donor Name */}
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

            {/* Amount Selection (hidden when item selected; item block shows qty × price) */}
            {!selectedItem && (
              <div className="space-y-4">
                <Label className={`text-sm font-semibold ${langClass}`}>
                  Donation Amount <span className="text-destructive">*</span>
                </Label>

              {/* Quick Amount Buttons */}
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

              {/* Custom Amount Input */}
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

              {link.suggestedAmount && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>💡</span>
                  <span>Suggested amount: ₹{link.suggestedAmount.toLocaleString('en-IN')}</span>
                </p>
              )}
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

            {/* Donate Button */}
            <Button
              className={`w-full h-12 gap-2 text-base font-semibold shadow-lg ${
                submitting ||
                (selectedItem ? selectedItem.unitPrice * itemQuantity < 1 : !amount || Number(amount) < 1)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              onClick={handleDonate}
              disabled={
                submitting ||
                (selectedItem ? selectedItem.unitPrice * itemQuantity < 1 : !amount || Number(amount) < 1)
              }
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

            {/* Security Info */}
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
