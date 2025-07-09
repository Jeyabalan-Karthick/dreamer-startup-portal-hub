import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail, checkPasswordStrength, validatePassword } from "@/lib/validation-utils";
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    passwordHint: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      // First check if email is already registered
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        // Email is already registered
        toast({
          title: "Email Already Registered",
          description: "This email address is already registered. Please enter a different email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

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

      // Store password hint and remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('passwordHint', formData.passwordHint);
      }

      console.log('Registration successful:', data);

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration Successful",
          description: "Please check your email and click the verification link to complete your registration.",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Welcome! You can now access the application.",
        });
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
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-syne">Sign Up</CardTitle>
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
                      placeholder="Enter your email "
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-800 dark:text-gray-200 font-medium font-syne">Password*</Label>
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

                  {formData.password && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={passwordStrength.requirements.length ? "text-green-500" : "text-red-500"}>
                            {passwordStrength.requirements.length ? "✓" : "✗"}
                          </span>
                          <span>8+ characters</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={passwordStrength.requirements.uppercase ? "text-green-500" : "text-red-500"}>
                            {passwordStrength.requirements.uppercase ? "✓" : "✗"}
                          </span>
                          <span>Uppercase letter</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={passwordStrength.requirements.lowercase ? "text-green-500" : "text-red-500"}>
                            {passwordStrength.requirements.lowercase ? "✓" : "✗"}
                          </span>
                          <span>Lowercase letter</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={passwordStrength.requirements.number ? "text-green-500" : "text-red-500"}>
                            {passwordStrength.requirements.number ? "✓" : "✗"}
                          </span>
                          <span>Number</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={passwordStrength.requirements.special ? "text-green-500" : "text-red-500"}>
                            {passwordStrength.requirements.special ? "✓" : "✗"}
                          </span>
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;