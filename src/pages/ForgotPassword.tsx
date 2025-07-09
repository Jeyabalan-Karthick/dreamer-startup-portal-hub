import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Prefill email if coming from login page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if email is registered
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // Email not found in profiles
        toast({
          title: "Email Not Registered",
          description: "This email address is not registered. Please enter a registered email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Use resetPasswordForEmail to trigger password reset OTP
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the 6-digit verification code.",
      });

      setStep('otp');
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (error) {
        toast({
          title: "Invalid OTP",
          description: "The OTP code is incorrect or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Navigate to reset password page with email as state
      navigate('/reset-password', { state: { email, verified: true } });
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      {/* Dotted Pattern Background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #6b7280 2px, transparent 2px)`,
            backgroundSize: '8px 8px',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />
      </div>

      <div className="absolute top-40 right-32 w-40 h-40 opacity-15">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #6b7280 2px, transparent 2px)`,
            backgroundSize: '10px 10px',
            clipPath: 'circle(50% at 50% 50%)'
          }}
        />
      </div>

      <div className="absolute bottom-32 left-40 w-36 h-36 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #6b7280 2px, transparent 2px)`,
            backgroundSize: '8px 8px',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
          }}
        />
      </div>

      <div className="absolute bottom-20 right-20 w-28 h-28 opacity-25">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #6b7280 2px, transparent 2px)`,
            backgroundSize: '6px 6px',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 font-syne">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-syne">
                {step === 'email' ? 'Forgot Password' : 'Verify OTP'}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 font-syne">
                {step === 'email' 
                  ? 'Enter your email address and we\'ll send you a verification code.' 
                  : 'Enter the 6-digit code sent to your email.'
                }
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Email address*</Label>
                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium text-lg rounded-md mt-8 font-syne transition-colors duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send OTP →'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Verification Code*</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        className="font-syne"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-lg font-syne border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center font-syne">
                      Code sent to {email}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium text-lg rounded-md mt-8 font-syne transition-colors duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP →'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne transition-colors duration-200"
                    >
                      ← Back to Email
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 font-syne">
                  Remember your password?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;