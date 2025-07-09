
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Login attempt:', { email: formData.email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2 font-syne">Log In</CardTitle>
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
                      placeholder="Enter your email"
                    />
                  </div>
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
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-md mt-8 font-syne"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Log in →'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:underline font-medium font-syne text-sm"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 font-syne">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:underline font-medium font-syne"
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
