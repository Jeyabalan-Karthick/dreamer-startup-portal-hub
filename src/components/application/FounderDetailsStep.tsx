import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface FounderDetailsData {
  founderName: string;
  startupName: string;
  email: string;
  phone: string;
  companyType: string;
  companyTypeOther?: string;
  teamSize: string;
  source: string;
  sourceOther?: string;
  couponCode: string;
}

interface FounderDetailsStepProps {
  data: FounderDetailsData;
  updateData: (data: Partial<FounderDetailsData>) => void;
  onNext: () => void;
}

const FounderDetailsStep = ({ data, updateData, onNext }: FounderDetailsStepProps) => {
  const [loading, setLoading] = useState(true);
  const [showCompanyTypeOther, setShowCompanyTypeOther] = useState(data.companyType === 'Others');
  const [showSourceOther, setShowSourceOther] = useState(data.source === 'Other');
  const [companyTypeOther, setCompanyTypeOther] = useState(data.companyTypeOther || '');
  const [sourceOther, setSourceOther] = useState(data.sourceOther || '');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid' | 'checking'>('idle');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponId, setCouponId] = useState<string | null>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      // Simulate loading time for smoother UX
      await new Promise(resolve => setTimeout(resolve, 600));
      setLoading(false);
    };

    initializeComponent();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleCompanyTypeChange = (value: string) => {
    handleInputChange('companyType', value);
    setShowCompanyTypeOther(value === 'Others');
    if (value !== 'Others') {
      setCompanyTypeOther('');
      updateData({ companyTypeOther: '' });
    }
  };

  const handleSourceChange = (value: string) => {
    handleInputChange('source', value);
    setShowSourceOther(value === 'Other');
    if (value !== 'Other') {
      setSourceOther('');
      updateData({ sourceOther: '' });
    }
  };

  const handleCompanyTypeOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyTypeOther(e.target.value);
    updateData({ companyTypeOther: e.target.value });
  };

  const handleSourceOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceOther(e.target.value);
    updateData({ sourceOther: e.target.value });
  };

  const validateCoupon = async (code: string) => {
    setCouponStatus('checking');
    setCouponMessage('');
    if (!code) {
      setCouponStatus('idle');
      setCouponId(null);
      return;
    }
    // 1. Find the coupon
    const { data: coupon, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', code)
      .single();
    if (error || !coupon) {
      setCouponStatus('invalid');
      setCouponMessage('Invalid coupon code');
      setCouponId(null);
      return;
    }

    // 2. Check if coupon is active
    if (!coupon.is_active) {
      setCouponStatus('invalid');
      setCouponMessage('This coupon code is inactive');
      setCouponId(null);
      return;
    }

    // 3. Check expiry
    const now = new Date();
    if (new Date(coupon.expires_at) < now) {
      setCouponStatus('invalid');
      setCouponMessage('Coupon expired');
      setCouponId(null);
      return;
    }
    // 4. Count usages
    const { count, error: usageError } = await supabase
      .from('coupon_code_usages')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_code_id', coupon.id);
    if (usageError) {
      setCouponStatus('invalid');
      setCouponMessage('Error checking coupon usage');
      setCouponId(null);
      return;
    }
    if (count >= coupon.max_uses) {
      setCouponStatus('invalid');
      setCouponMessage('Coupon usage limit reached');
      setCouponId(null);
      return;
    }
    setCouponStatus('valid');
    setCouponMessage('Coupon valid!');
    setCouponId(coupon.id);
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('couponCode', e.target.value);
    validateCoupon(e.target.value);
  };

  // Skeleton loading screen
  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-600 dark:bg-gray-800 shadow-lg dark:shadow-gray-700/20">
        <CardHeader>
          <Skeleton className="h-7 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Name and Startup fields skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Email and Phone fields skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Company Type, Team Size, Source fields skeleton */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Coupon Code field skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Submit button skeleton */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const requiredFields = ['founderName', 'startupName', 'email', 'phone', 'companyType', 'teamSize', 'source', 'couponCode'];
    const missingFields = requiredFields.filter(field => !data[field] || (data[field] === 'Others' && !companyTypeOther) || (data[field] === 'Other' && !sourceOther));

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (couponStatus !== 'valid' || !couponId) {
      toast({
        title: 'Invalid Coupon',
        description: couponMessage || 'Please enter a valid coupon code',
        variant: 'destructive',
      });
      return;
    }

    // Insert coupon usage
    const { error: usageInsertError } = await supabase
      .from('coupon_code_usages')
      .insert({
        coupon_code_id: couponId,
        used_by_email: data.email,
      });

    if (usageInsertError) {
      if (
        usageInsertError.code === '23505' ||
        usageInsertError.message?.includes('duplicate key value')
      ) {
        toast({
          title: 'Coupon Already Used',
          description: 'You have already used this coupon code with this email.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Coupon Error',
          description: 'Failed to record coupon usage. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    // If 'Others' is selected, use the custom value
    const submitData = {
      ...data,
      companyType: data.companyType === 'Others' ? companyTypeOther : data.companyType,
      source: data.source === 'Other' ? sourceOther : data.source,
    };
    console.log('Step 1 data:', submitData);
    updateData(submitData); // update parent with resolved values
    onNext();
  };

  return (
    <Card className="border-gray-200 dark:border-gray-600 dark:bg-gray-800 shadow-lg dark:shadow-gray-700/20">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white text-xl font-semibold">Founder & Startup Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founderName" className="text-gray-800 dark:text-gray-200 font-medium">Founder Name *</Label>
              <Input
                id="founderName"
                value={data.founderName || ''}
                onChange={(e) => handleInputChange('founderName', e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startupName" className="text-gray-800 dark:text-gray-200 font-medium">Startup Name *</Label>
              <Input
                id="startupName"
                value={data.startupName || ''}
                onChange={(e) => handleInputChange('startupName', e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter your startup name"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                readOnly
                className="border-gray-300 bg-gray-100 cursor-not-allowed dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-800 dark:text-gray-200 font-medium">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-800 dark:text-gray-200 font-medium">Company Type *</Label>
              <Select value={data.companyType || ''} onValueChange={handleCompanyTypeChange}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Select type" className="placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="MSME" className="dark:text-gray-100 dark:hover:bg-gray-700">MSME</SelectItem>
                  <SelectItem value="Pvt Ltd" className="dark:text-gray-100 dark:hover:bg-gray-700">Pvt Ltd</SelectItem>
                  <SelectItem value="Others" className="dark:text-gray-100 dark:hover:bg-gray-700">Others</SelectItem>
                </SelectContent>
              </Select>
              {/* Animated input for Others */}
              <div style={{
                maxHeight: showCompanyTypeOther ? 60 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                {showCompanyTypeOther && (
                  <Input
                    className="mt-2 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Please specify company type"
                    value={companyTypeOther}
                    onChange={handleCompanyTypeOtherChange}
                    required={showCompanyTypeOther}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-800 dark:text-gray-200 font-medium">Team Size *</Label>
              <Select value={data.teamSize || ''} onValueChange={(value) => handleInputChange('teamSize', value)}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Select size" className="placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="1" className="dark:text-gray-100 dark:hover:bg-gray-700">1 Member</SelectItem>
                  <SelectItem value="2-5" className="dark:text-gray-100 dark:hover:bg-gray-700">2-5 Members</SelectItem>
                  <SelectItem value="6-10" className="dark:text-gray-100 dark:hover:bg-gray-700">6-10 Members</SelectItem>
                  <SelectItem value="10+" className="dark:text-gray-100 dark:hover:bg-gray-700">10+ Members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-800 dark:text-gray-200 font-medium">How did you hear about us? *</Label>
              <Select value={data.source || ''} onValueChange={handleSourceChange}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Select source" className="placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="Social Media" className="dark:text-gray-100 dark:hover:bg-gray-700">Social Media</SelectItem>
                  <SelectItem value="Friend/Referral" className="dark:text-gray-100 dark:hover:bg-gray-700">Friend/Referral</SelectItem>
                  <SelectItem value="Event" className="dark:text-gray-100 dark:hover:bg-gray-700">Event</SelectItem>
                  <SelectItem value="Website" className="dark:text-gray-100 dark:hover:bg-gray-700">Website</SelectItem>
                  <SelectItem value="Other" className="dark:text-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                </SelectContent>
              </Select>
              {/* Animated input for Other */}
              <div style={{
                maxHeight: showSourceOther ? 60 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                {showSourceOther && (
                  <Input
                    className="mt-2 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Please specify how you heard about us"
                    value={sourceOther}
                    onChange={handleSourceOtherChange}
                    required={showSourceOther}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="couponCode" className="text-gray-800 dark:text-gray-200 font-medium">Coupon Code *</Label>
            <div className="relative">
              <Input
                id="couponCode"
                value={data.couponCode || ''}
                onChange={handleCouponChange}
                className="border-gray-300 pr-10 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter your coupon code"
                required
              />
              {/* Animated status icon */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 transition-all">
                {couponStatus === 'checking' && (
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                )}
                {couponStatus === 'valid' && (
                  <CheckCircle2 className="text-green-500 animate-bounce" />
                )}
                {couponStatus === 'invalid' && (
                  <XCircle className="text-red-500 animate-shake" />
                )}
              </span>
            </div>
            {couponStatus === 'invalid' && (
              <p className="text-sm text-red-500 transition-all">{couponMessage}</p>
            )}
            {couponStatus === 'valid' && (
              <p className="text-sm text-green-600 transition-all">{couponMessage}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
              </svg>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                If you don't have a coupon code,&nbsp;
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=brandmindzteam@gmail.com&su=Need%20Coupon%20Code%20for%20Application&body=Hi%20Team%2C%0A%0AI%20would%20like%20to%20request%20a%20coupon%20code%20for%20the%20incubation%20program.%0A%0ARegards%2C%0A"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => {
                    // Add user's email to the body if available
                    if (data.email) {
                      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=brandmindzteam@gmail.com&su=Need%20Coupon%20Code%20Code%20for%20Application&body=Hi%20Team%2C%0A%0AI%20would%20like%20to%20request%20a%20coupon%20code%20for%20the%20incubation%20program.%0A%0ARegards%2C%0A${encodeURIComponent(data.email)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                      e.preventDefault();
                    }
                  }}
                >
                  contact us
                </a>
                .
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium px-8 py-2 rounded-md transition-colors duration-200"
            >
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FounderDetailsStep;