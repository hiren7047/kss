import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DonationFormProps {
  onClose?: () => void;
  defaultAmount?: number;
  defaultPurpose?: 'event' | 'general' | 'emergency';
}

const donationAmounts = [500, 1000, 2500, 5000, 10000, 25000];

export const DonationForm = ({ onClose, defaultAmount, defaultPurpose = 'general' }: DonationFormProps) => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [customAmount, setCustomAmount] = useState('');
  const [purpose, setPurpose] = useState<'event' | 'general' | 'emergency'>(defaultPurpose);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (defaultAmount) {
      setAmount(defaultAmount);
    }
  }, [defaultAmount]);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const generateReceiptNumber = () => {
    return `KSS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!donorName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (amount <= 0) {
      setError('Please select or enter a valid donation amount');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please provide either email or phone number');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const receiptNumber = generateReceiptNumber();
      
      // Create Razorpay order
      const orderResponse = await publicApi.createDonationOrder({
        amount,
        receiptNumber,
        notes: {
          donorName,
          email: email || '',
          phone: phone || '',
          purpose,
          message: message || '',
          isAnonymous: isAnonymous.toString(),
        },
      });

      const { orderId, keyId } = orderResponse.data;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      // Initialize Razorpay checkout
      const options = {
        key: keyId,
        amount: orderResponse.data.amount, // Amount in paise
        currency: orderResponse.data.currency || 'INR',
        name: 'Krishna Sada Sahayate',
        description: `Donation for ${purpose}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await publicApi.verifyDonationPayment({
              donationData: {
                donorName,
                amount,
                purpose,
                isAnonymous,
              },
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setSuccessData(verifyResponse.data);
            setStep('success');
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setError(error.response?.data?.message || 'Payment verification failed');
            setStep('error');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: donorName,
          email: email || undefined,
          contact: phone || undefined,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setStep('form');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Donation error:', error);
      setError(error.response?.data?.message || 'Failed to process donation. Please try again.');
      setStep('error');
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 max-w-md mx-auto text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className={`text-2xl font-bold mb-2 ${langClass}`}>Thank You!</h2>
        <p className={`text-muted-foreground mb-4 ${langClass}`}>
          Your donation has been received successfully.
        </p>
        {successData && (
          <div className="bg-muted rounded-lg p-4 mb-4 text-left">
            <p className="text-sm"><strong>Receipt Number:</strong> {successData.receiptNumber}</p>
            <p className="text-sm"><strong>Amount:</strong> ₹{successData.amount.toLocaleString('en-IN')}</p>
            <p className="text-sm"><strong>Payment ID:</strong> {successData.razorpayPaymentId}</p>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button onClick={() => { setStep('form'); setSuccessData(null); }} className="flex-1">
            Donate Again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (step === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 max-w-md mx-auto text-center"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className={`text-2xl font-bold mb-2 ${langClass}`}>Payment Failed</h2>
        <p className={`text-muted-foreground mb-4 ${langClass}`}>{error}</p>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button onClick={() => { setStep('form'); setError(''); }} className="flex-1">
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto relative"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <h2 className={`text-2xl font-bold mb-6 text-center ${langClass}`}>
        Make a Donation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="donorName">Name *</Label>
            <Input
              id="donorName"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <Label>Donation Amount (₹) *</Label>
          <div className="grid grid-cols-3 gap-3">
            {donationAmounts.map((amt) => (
              <Button
                key={amt}
                type="button"
                variant={amount === amt ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(amt)}
                className="rounded-lg"
              >
                ₹{amt.toLocaleString('en-IN')}
              </Button>
            ))}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Or enter custom amount"
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              min="1"
              step="1"
            />
          </div>
          {amount > 0 && (
            <p className="text-sm text-muted-foreground">
              Selected: <strong>₹{amount.toLocaleString('en-IN')}</strong>
            </p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <Label htmlFor="purpose">Purpose *</Label>
          <select
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="general">General Donation</option>
            <option value="event">Event Support</option>
            <option value="emergency">Emergency Fund</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any message you'd like to share..."
            rows={3}
          />
        </div>

        {/* Anonymous */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="cursor-pointer">
            Donate anonymously
          </Label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || amount <= 0}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Donate ₹{amount > 0 ? amount.toLocaleString('en-IN') : '0'}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
