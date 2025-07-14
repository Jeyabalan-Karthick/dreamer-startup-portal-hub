The code adds a skeleton loading screen to the landing page while it's loading, enhancing the user experience during initial load.
```

```replit_final_file
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '@/components/LandingPage';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    // Check if there's a coupon code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const couponCode = urlParams.get('code');

    if (couponCode) {
      // Redirect to register page with coupon code
      navigate(`/register?code=${couponCode}`);
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate]);

  // Skeleton loading screen
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <ThemeToggle />

        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <Skeleton className="h-12 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-4" />
              <Skeleton className="h-6 w-80 mx-auto mb-8" />
              <div className="flex gap-4 justify-center">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section Skeleton */}
        <div className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-5 w-96 mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                  <CardHeader className="text-center">
                    <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Section Skeleton */}
        <div className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-8" />
            <div className="max-w-md mx-auto">
              <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader>
                  <Skeleton className="h-6 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Skeleton className="w-48 h-48 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-64" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <footer className="bg-gray-900 dark:bg-black text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-4 w-80 mx-auto bg-gray-700" />
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div>
      <ThemeToggle />
      <LandingPage />
    </div>
  );
};

export default Index;