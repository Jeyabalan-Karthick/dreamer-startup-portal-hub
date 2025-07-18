
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Dreamers Startup
              <span className="text-gray-600 dark:text-gray-300"> Incubation Portal</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Join our startup incubation program and transform your innovative ideas into successful businesses. 
              Get access to ₹40,000 in benefits, mentorship, and resources.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Application <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/login')}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 text-lg font-semibold transition-colors duration-200"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Dreamers?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Join hundreds of successful startups in our incubation program</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Expert Mentorship</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Get guidance from industry experts and successful entrepreneurs who have built and scaled companies.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">₹40,000 Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Access to cloud credits, software tools, legal support, and other resources worth ₹40,000.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Network Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Connect with other founders, investors, and industry professionals in our exclusive network.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Quick Access</h2>
          <div className="max-w-md mx-auto">
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">QR Code Registration</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Scan this QR code to quickly access the registration page with your event coupon code
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">QR Code</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">Will link to /register?code=EVENT2025</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Print this QR code for events and marketing materials</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 dark:text-gray-500">© 2024 Dreamers Startup Incubation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
