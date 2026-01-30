import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { volunteerApi, VolunteerLoginRequest } from "@/lib/api/volunteer";
import { toast } from "sonner";

export default function VolunteerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const volunteerToken = localStorage.getItem('volunteerAccessToken');
    if (volunteerToken) {
      navigate("/volunteer/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: VolunteerLoginRequest = { registrationId, password };
      const response = await volunteerApi.login(loginData);
      const { volunteer, accessToken, refreshToken } = response.data;

      // Store tokens and volunteer data
      localStorage.setItem('volunteerAccessToken', accessToken);
      localStorage.setItem('volunteerRefreshToken', refreshToken);
      localStorage.setItem('volunteer', JSON.stringify(volunteer));

      toast.success('Login successful!');
      navigate("/volunteer/dashboard", { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
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
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-white">Krishna Sada Sahayate</h1>
              <p className="text-sm text-white/70">Volunteer Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium text-white leading-relaxed">
            "Join hands with us to make a difference in the community."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-white/60 text-sm">Volunteer Portal</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">
              Enter your registration ID and password to access your volunteer account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registrationId">Registration ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="registrationId"
                    type="text"
                    placeholder="VOL-2026-00123"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
            >
              {isLoading ? (
                "Logging in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have an account? Contact admin for registration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
