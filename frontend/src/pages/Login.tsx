import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine if input is email or mobile
      const isEmail = emailOrMobile.includes("@");
      const loginData = isEmail
        ? { email: emailOrMobile, password }
        : { mobile: emailOrMobile, password };

      await login(loginData);
      navigate("/", { replace: true });
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img 
              src="/kss-logo.png" 
              alt="KSS Logo" 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary font-bold text-lg shadow-lg hidden">
              KSS
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Krishna Sada Sahayate</h1>
              <p className="text-sm text-white/70">NGO Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium text-white leading-relaxed">
            "Empowering communities through transparency, trust, and collective action."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-white/60 text-sm">Serving since 2015</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-white/70">Lives Impacted</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold text-white">₹50L+</p>
              <p className="text-xs text-white/70">Funds Utilized</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold text-white">200+</p>
              <p className="text-xs text-white/70">Events Conducted</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          © 2026 KSS. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <img 
              src="/kss-logo.png" 
              alt="KSS Logo" 
              className="h-14 w-14 mx-auto mb-4 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline-flex';
              }}
            />
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg mb-4 hidden">
              KSS
            </div>
            <h1 className="text-xl font-bold">Krishna Sada Sahayate</h1>
            <p className="text-sm text-muted-foreground">NGO Admin Portal</p>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your admin account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Mobile</Label>
                <div className="relative">
                  {emailOrMobile.includes("@") ? (
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin@krushnasadasahayte.org or 1234567890"
                    className="pl-10"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" size="lg">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Contact IT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
