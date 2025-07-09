
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    passwordHint: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  // Load saved data on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedHint = localStorage.getItem('password_hint');
    if (savedEmail && savedHint) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        passwordHint: savedHint,
        rememberMe: true
      }));
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 8;

    const validCriteria = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLengthValid].filter(Boolean).length;

    let strength = { score: 0, feedback: '' };
    
    if (validCriteria <= 2) {
      strength = { score: 1, feedback: 'Weak' };
    } else if (validCriteria <= 4) {
      strength = { score: 2, feedback: 'Medium' };
    } else {
      strength = { score: 3, feedback: 'Strong' };
    }

    return {
      isValid: validCriteria === 5,
      strength,
      missing: {
        length: !isLengthValid,
        uppercase: !hasUpperCase,
        lowercase: !hasLowerCase,
        number: !hasNumber,
        special: !hasSpecialChar
      }
    };
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    const validation = validatePassword(password);
    setPasswordStrength(validation.strength);
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid Gmail address (lowercase letters only).",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      const missing = [];
      if (passwordValidation.missing.length) missing.push("at least 8 characters");
      if (passwordValidation.missing.uppercase) missing.push("one uppercase letter");
      if (passwordValidation.missing.lowercase) missing.push("one lowercase letter");
      if (passwordValidation.missing.number) missing.push("one number");
      if (passwordValidation.missing.special) missing.push("one special character");
      
      toast({
        title: "Invalid Password",
        description: `Password must contain: ${missing.join(", ")}.`,
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
        title: "Password Hint Required",
        description: "Please provide a password hint to help you remember your password.",
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
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Save remember me data
      if (formData.rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
        localStorage.setItem('password_hint', formData.passwordHint);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('password_hint');
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
    if (name === 'password') {
      handlePasswordChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2 font-syne">Sign Up</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800 font-medium font-syne">Email address*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 focus:border-gray-900 bg-white font-syne relative"
                      placeholder="Enter your Gmail address"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Must be a valid Gmail address (lowercase letters only)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800 font-medium font-syne">Password*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 focus:border-gray-900 bg-white font-syne relative"
                      placeholder="Create a password"
                      showPasswordToggle
                    />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                            style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score === 1 ? 'text-red-500' : 
                          passwordStrength.score === 2 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.feedback}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Must contain: 8+ characters, uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-800 font-medium font-syne">Confirm Password*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 focus:border-gray-900 bg-white font-syne relative"
                      placeholder="Confirm your password"
                      showPasswordToggle
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordHint" className="text-gray-800 font-medium font-syne">Password Hint*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="passwordHint"
                      name="passwordHint"
                      type="text"
                      required
                      value={formData.passwordHint}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 focus:border-gray-900 bg-white font-syne relative"
                      placeholder="Enter a hint to remember your password"
                    />
                  </div>
                  <p className="text-xs text-gray-500">This will help you remember your password when logging in</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700 font-syne">
                    Remember my email and password hint
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-md mt-8 font-syne"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign up →'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 font-syne">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:underline font-medium font-syne"
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
