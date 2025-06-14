
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    couponCode: searchParams.get('code') || ''
  });
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.couponCode) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Registration attempt:', { email: formData.email, couponCode: formData.couponCode });
    
    // TODO: Implement Firebase Auth registration
    toast({
      title: "Registration Successful",
      description: "Please check your email for verification",
    });
    
    // For now, redirect to application form
    setTimeout(() => {
      navigate('/application');
    }, 2000);
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Register for the Dreamers Startup Incubation Program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="couponCode" className="text-gray-700">Coupon Code *</Label>
                <Input
                  id="couponCode"
                  name="couponCode"
                  type="text"
                  required
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Enter coupon code"
                />
                <p className="text-sm text-gray-500">Required to access the incubation program</p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-900 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
