import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      // Check if we have the required verification from the forgot password flow
      const state = location.state as { email?: string; verified?: boolean } | null;

      if (!state?.email || !state?.verified) {
        toast({
          title: "Access Denied",
          description: "Please complete the email verification process first.",
          variant: "destructive",
        });
        navigate('/forgot-password');
        return;
      }

      setEmail(state.email);
      
      // Simulate loading time for smoother UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setPageLoading(false);
    };

    initializePage();
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
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
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      // Sign out to ensure user logs in with new password
      await supabase.auth.signOut();

      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
                <Skeleton className="h-10 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-56 mx-auto" />
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  {/* Password field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Confirm Password field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  {/* Submit button skeleton */}
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
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2 font-syne">Reset Password</CardTitle>
              <p className="text-gray-600 font-syne">Enter your new password below.</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800 font-medium font-syne">New Password*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative"
                      placeholder="Enter new password"
                      showPasswordToggle
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-800 font-medium font-syne">Confirm New Password*</Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-800 dark:text-gray-100 font-syne relative"
                      placeholder="Confirm new password"
                      showPasswordToggle
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-md mt-8 font-syne"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating Password...' : 'Update Password →'}
                </Button>
              </form>

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

export default ResetPassword;