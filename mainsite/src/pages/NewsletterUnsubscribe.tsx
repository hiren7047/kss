import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

const NewsletterUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link.');
      return;
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiBase}/public/newsletter/unsubscribe/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          setStatus('success');
          setMessage('You have been unsubscribed from our newsletter.');
        } else {
          setStatus('error');
          setMessage(data?.message || 'Unable to unsubscribe. Link may be expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error while unsubscribing. Please try again later.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-card p-8 text-center space-y-4">
          {status === 'success' ? (
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          ) : status === 'error' ? (
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
          ) : null}
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            {status === 'pending' ? 'Unsubscribing…' : 'Newsletter Preference'}
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button
            className="mt-2 rounded-full"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Back to Home
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsletterUnsubscribe;

