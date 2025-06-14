
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Gift, Users, Download, Phone } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ApplicationSuccessProps {
  applicationId: string;
}

const ApplicationSuccess = ({ applicationId }: ApplicationSuccessProps) => {
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('status')
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching application status:', error);
          return;
        }

        if (data) {
          setApplicationStatus(data.status);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();

    // Set up real-time subscription for status changes
    const subscription = supabase
      .channel('application-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: `id=eq.${applicationId}`
      }, (payload) => {
        setApplicationStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for submitting your application. We've sent it to the incubation center admin for review.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">⏳ Waiting for Admin Approval</p>
            <p className="text-yellow-700 text-sm mt-1">
              You'll receive an email notification once your application is reviewed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applicationStatus === 'approved') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-700">🎉 Congratulations!</CardTitle>
          <p className="text-xl text-gray-600">Your application has been approved!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Gift className="mr-2" />
              ₹40,000 Worth of Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Expert Consultation Booking</h4>
                    <p className="text-sm text-gray-600">1-on-1 sessions with industry experts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Premium Resource Downloads</h4>
                    <p className="text-sm text-gray-600">Business templates, guides, and tools</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Dedicated Support Contact</h4>
                    <p className="text-sm text-gray-600">Direct line to our support team</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Gift className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Partner Tools & Credits</h4>
                    <p className="text-sm text-gray-600">Access to premium software and services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📞 Support Contact Information</h4>
            <div className="text-sm text-blue-700">
              <p>Email: support@dreamersincubation.com</p>
              <p>Phone: +91-9876543210</p>
              <p>WhatsApp: +91-9876543210</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button className="bg-green-600 hover:bg-green-700">
              Book Consultation
            </Button>
            <Button variant="outline">
              Download Resources
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Application Not Approved</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Unfortunately, your application was not approved at this time.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Next Steps</p>
            <p className="text-red-700 text-sm mt-1">
              You can contact support for feedback or submit a new application in the future.
            </p>
          </div>
          <Button variant="outline" className="mt-4">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ApplicationSuccess;
