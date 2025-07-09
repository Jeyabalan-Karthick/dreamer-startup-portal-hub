
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send 6-digit OTP to email for password reset
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // Only send OTP if email exists
        }
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
        description: "Please check your email for the verification code. If you don't receive it, the email may not be registered.",
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
        type: 'email'
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
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)'
    }}>
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
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2 font-syne">
                {step === 'email' ? 'Forgot Password' : 'Verify OTP'}
              </CardTitle>
              <p className="text-gray-600 font-syne">
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
                    <Label htmlFor="email" className="text-gray-800 font-medium font-syne">Email address*</Label>
                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-gray-300 focus:border-gray-900 bg-white font-syne relative"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-md mt-8 font-syne"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send OTP →'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-800 font-medium font-syne">Verification Code*</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        className="font-syne"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-lg font-syne border-gray-300 focus:border-gray-900" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-sm text-gray-600 text-center font-syne">
                      Code sent to {email}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-md mt-8 font-syne"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP →'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-blue-600 hover:underline font-medium font-syne"
                    >
                      ← Back to Email
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-600 font-syne">
                  Remember your password?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:underline font-medium font-syne"
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
