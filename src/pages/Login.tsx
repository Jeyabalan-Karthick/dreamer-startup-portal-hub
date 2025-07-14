import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "@/lib/validation-utils";
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      // Simulate loading time for smoother UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load remembered email if available
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      const storedHint = localStorage.getItem('passwordHint');

      if (rememberedEmail) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      }

      if (storedHint) {
        setPasswordHint(storedHint);
      }
      
      setPageLoading(false);
    };

    initializePage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    console.log('Login attempt:', { email: formData.email });

    try {
      // First try to sign in and handle specific errors
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);

        // Check if it's an invalid credentials error (could be wrong email or password)
        if (error.message.includes('Invalid login credentials')) {
          // Try to determine if email exists by attempting password reset
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: 'https://example.com/dummy'  // dummy URL, we just want to test email existence
          });

          // If reset email fails with user not found, email doesn't exist
          if (resetError && (resetError.message.includes('User not found') || resetError.message.includes('Unable to validate email address'))) {
            toast({
              title: "Email Not Registered",
              description: "This email address is not registered. Please enter a registered email address.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          // If we reach here, email exists but password is wrong
          setPasswordAttempts(prev => {
            const newAttempts = prev + 1;
            if (newAttempts >= 2) {
              setShowPasswordHint(true);
            }
            return newAttempts;
          });

          toast({
            title: "Login Failed",
            description: "Password is wrong. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Handle other auth errors
        let errorMessage = error.message;
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('passwordHint');
      }

      console.log('Login successful:', data);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect to application form
      navigate('/application');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
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
      // Reset password attempts when email changes
      setPasswordAttempts(0);
      setShowPasswordHint(false);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
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
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Remember me skeleton */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Login button skeleton */}
                  <Skeleton className="h-12 w-full" />
                </div>

                {/* Links skeleton */}
                <div className="mt-6 text-center">
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>

                <div className="mt-6 text-center">
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
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-syne">Log In</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Enter your email (e.g., user@gmail.com)"
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Password*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Hint Section - Show after 2 failed attempts */}
                  {showPasswordHint && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showHint"
                          checked={showHint}
                          onCheckedChange={(checked) => setShowHint(checked as boolean)}
                        />
                        <Label htmlFor="showHint" className="text-sm text-gray-600 dark:text-gray-400 font-syne flex items-center">
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Show password hint
                        </Label>
                      </div>
                      {showHint && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          {passwordHint ? (
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-syne">
                              <strong>Hint:</strong> {passwordHint}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-syne">
                              No password hint available. You can set one during registration.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                  {isLoading ? 'Signing In...' : 'Log in →'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/forgot-password', { state: { email: formData.email } })}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne text-sm transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 font-syne">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium font-syne transition-colors duration-200"
                  >
                    Sign up
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

export default Login;