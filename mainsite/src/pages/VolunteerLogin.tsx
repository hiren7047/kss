import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { volunteerApi } from '@/lib/volunteerApi';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [password, setPassword] = useState('');

  // Check if already logged in
  useEffect(() => {
    const volunteerToken = localStorage.getItem('volunteerAccessToken');
    if (volunteerToken) {
      navigate('/volunteer/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await volunteerApi.login({ registrationId, password });
      const { volunteer, accessToken, refreshToken } = response.data;

      // Store tokens and volunteer data
      localStorage.setItem('volunteerAccessToken', accessToken);
      localStorage.setItem('volunteerRefreshToken', refreshToken);
      localStorage.setItem('volunteer', JSON.stringify(volunteer));

      toast.success('Login successful!');
      navigate('/volunteer/dashboard', { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="p-8 shadow-lg">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className={`text-2xl ${langClass}`}>
                  Volunteer Login
                </CardTitle>
                <CardDescription className={langClass}>
                  Enter your registration ID and password to access your volunteer account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationId" className={langClass}>
                        Registration ID *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="registrationId"
                          type="text"
                          placeholder="VOL-2026-00123"
                          value={registrationId}
                          onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className={langClass}>
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      'Logging in...'
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/volunteer" className="text-primary hover:underline font-medium">
                      Register as Volunteer
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Forgot your credentials? Contact admin for assistance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
