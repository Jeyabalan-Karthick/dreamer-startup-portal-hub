
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail, checkPasswordStrength, validatePassword } from "@/lib/validation-utils";
import { Eye, EyeOff, HelpCircle, Info } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'registration' | 'otp'>('registration');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    passwordHint: ''
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  useEffect(() => {
    const initializePage = async () => {
      // Simulate loading time for smoother UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setPageLoading(false);
    };

    initializePage();
  }, []);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address (lowercase, @gmail.com format)');
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Error",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.passwordHint.trim()) {
      toast({
        title: "Error",
        description: "Please provide a password hint",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Registration attempt:', { email: formData.email });

    try {
      const redirectUrl = "https://dreamer-startup-portal-hub.vercel.app/login";

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific error for already registered email
        if (error.message.includes('User already registered')) {
          toast({
            title: "Email Already Registered",
            description: "This email address is already registered. Please enter a different email address.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Registration successful:', data);

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration Successful",
          description: "Please check your email and enter the 6-digit verification code.",
        });
        setStep('otp');
      } else {
        toast({
          title: "Registration Successful",
          description: "Welcome! You can now access the application.",
        });
        
        // Store password hint and remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('passwordHint', formData.passwordHint);
        }
        
        navigate('/application');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
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
        email: formData.email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        toast({
          title: "Invalid OTP",
          description: "The OTP code is incorrect or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Store password hint and remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('passwordHint', formData.passwordHint);
      }

      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully. Welcome!",
      });

      // Navigate to application page
      navigate('/application');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time email validation
    if (name === 'email') {
      if (value.length > 0 && !validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  // Skeleton loading screen
  if (pageLoading) {
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

        {/* Main Content Skeleton */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 font-syne">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <Skeleton className="h-10 w-32 mx-auto mb-2" />
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  {/* Email field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Password field skeleton */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Confirm Password field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Password Hint field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-3 w-64" />
                  </div>

                  {/* Remember me skeleton */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Sign up button skeleton */}
                  <Skeleton className="h-12 w-full" />
                </div>

                {/* Links skeleton */}
                <div className="mt-8 text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                {step === 'registration' ? 'Sign Up' : 'Verify Email'}
              </CardTitle>
              {step === 'otp' && (
                <CardDescription className="text-gray-600 dark:text-gray-400 font-syne">
                  Enter the 6-digit code sent to your email
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {step === 'registration' ? (
                <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Email address*</Label>
                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative ${emailError ? 'border-red-500' : ''}`}
                        placeholder="Enter your email "
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="password" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Password*</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="text-xs space-y-1">
                                <p className="font-medium mb-2">Password must contain:</p>
                                <div className="flex items-center space-x-2">
                                  <span className={formData.password && passwordStrength.requirements.length ? "text-green-500" : "text-gray-400"}>
                                    {formData.password && passwordStrength.requirements.length ? "✓" : "•"}
                                  </span>
                                  <span>8+ characters</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={formData.password && passwordStrength.requirements.uppercase ? "text-green-500" : "text-gray-400"}>
                                    {formData.password && passwordStrength.requirements.uppercase ? "✓" : "•"}
                                  </span>
                                  <span>Uppercase letter</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={formData.password && passwordStrength.requirements.lowercase ? "text-green-500" : "text-gray-400"}>
                                    {formData.password && passwordStrength.requirements.lowercase ? "✓" : "•"}
                                  </span>
                                  <span>Lowercase letter</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={formData.password && passwordStrength.requirements.number ? "text-green-500" : "text-gray-400"}>
                                    {formData.password && passwordStrength.requirements.number ? "✓" : "•"}
                                  </span>
                                  <span>Number</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={formData.password && passwordStrength.requirements.special ? "text-green-500" : "text-gray-400"}>
                                    {formData.password && passwordStrength.requirements.special ? "✓" : "•"}
                                  </span>
                                  <span>Special character (!@#$%^&*)</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {formData.password && (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '#e5e7eb' }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : '#e5e7eb' }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '#e5e7eb' }}
                            />
                          </div>
                          <span className="text-xs font-medium ml-2" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Confirm Password*</Label>
                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordHint" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Password Hint*</Label>
                    <div className="relative overflow-hidden rounded-md">
                      <Input
                        id="passwordHint"
                        name="passwordHint"
                        type="text"
                        required
                        value={formData.passwordHint}
                        onChange={handleInputChange}
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative"
                        placeholder="Enter a hint to remember your password"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This hint will help you remember your password during login</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-syne">
                      Remember me 
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium text-lg rounded-md mt-8 font-syne transition-colors duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Sign up →'}
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
                      Code sent to {formData.email}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium text-lg rounded-md mt-8 font-syne transition-colors duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email →'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('registration')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne transition-colors duration-200"
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </form>
              )}

              {step === 'registration' && (
                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 font-syne">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne transition-colors duration-200"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
