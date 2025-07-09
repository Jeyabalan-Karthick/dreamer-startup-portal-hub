import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle, Clock, Gift, Users, Download, Phone, Mail, ExternalLink, Sparkles, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';

interface ApplicationSuccessProps {
  applicationId: string;
}

const ApplicationSuccess = ({ applicationId }: ApplicationSuccessProps) => {
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching application status:', error);
          return;
        }

        if (data) {
          setApplicationStatus(data.status);
          setApplicationData(data);
          
          // Show approval modal if status is approved and it's a new approval
          if (data.status === 'approved' && !showApprovalModal) {
            setShowApprovalModal(true);
          }
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
        setApplicationData(payload.new);
        
        // Show approval modal when status changes to approved
        if (payload.new.status === 'approved') {
          setShowApprovalModal(true);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [applicationId, showApprovalModal]);

  // Approval Modal Component
  const ApprovalModal = () => {
    useEffect(() => {
      if (showApprovalModal) {
        // Trigger confetti when modal opens
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }, [showApprovalModal]);

    return (
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-2xl overflow-y-auto">
          <div className="relative overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/80 hover:bg-white"
              onClick={() => setShowApprovalModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 text-center relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-300 animate-pulse" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                      <Gift className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-200 animate-bounce" />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">🎉 CONGRATULATIONS! 🎉</h1>
                <p className="text-base sm:text-lg md:text-xl text-green-100 font-medium">
                  Your startup application has been APPROVED!
                </p>
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 mt-3 sm:mt-4">
                  <p className="text-sm sm:text-base md:text-lg font-semibold">
                    Welcome to {applicationData?.incubation_centre}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Benefits Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg mb-6 sm:mb-8 border border-green-100">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">
                    <Gift className="mr-2 sm:mr-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    <span className="text-sm sm:text-base md:text-lg">₹40,000 Worth of Benefits Unlocked!</span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                    You now have access to exclusive resources and support
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="bg-blue-500 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Expert Consultation Booking</h4>
                        <p className="text-xs sm:text-sm text-gray-600">1-on-1 sessions with industry experts and mentors</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Premium Resource Downloads</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Business templates, pitch decks, legal documents & guides</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="bg-green-500 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Dedicated Support Contact</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Direct line to our support team for immediate assistance</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                      <div className="bg-orange-500 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Partner Tools & Credits</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Access to premium software, cloud credits & services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 border border-green-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Sparkles className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  Your Application Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600 mb-1 sm:mb-0">Startup Name:</span>
                    <span className="font-bold text-gray-800 break-words">{applicationData?.startup_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600 mb-1 sm:mb-0">Founder:</span>
                    <span className="font-bold text-gray-800 break-words">{applicationData?.founder_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600 mb-1 sm:mb-0">Incubation Centre:</span>
                    <span className="font-bold text-gray-800 break-words">{applicationData?.incubation_centre}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600 mb-1 sm:mb-0">Approved On:</span>
                    <span className="font-bold text-gray-800">
                      {applicationData?.approved_at ? new Date(applicationData.approved_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Contact */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                  <Mail className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  📞 Support Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-700">
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="break-all">brandmindzteam@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>+91-9876543210</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-blue-50 rounded-lg sm:col-span-2 lg:col-span-1">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>WhatsApp: +91-9876543210</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all w-full sm:w-auto">
                  <Users className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Book Consultation
                </Button>
                <Button variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold w-full sm:w-auto">
                  <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Download Resources
                </Button>
                <Button variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold w-full sm:w-auto">
                  <Mail className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg dark:shadow-gray-700/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Application Submitted Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Thank you for submitting your application. We've sent it to <strong className="text-gray-900 dark:text-white">{applicationData?.incubation_centre}</strong> admin for review.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-300 font-medium">⏳ Waiting for Admin Approval</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  You'll receive an email notification once your application is reviewed by the incubation center admin.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📧 Application Details Sent To:</h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm">{applicationData?.incubation_centre} Admin</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">The admin will review your application and approve/reject it.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'approved') {
    return (
      <>
        <ApprovalModal />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg dark:shadow-gray-700/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl text-green-700 dark:text-green-400 mb-2">🎉 Congratulations!</CardTitle>
                <p className="text-xl text-gray-600 dark:text-gray-300">Your application has been approved by {applicationData?.incubation_centre}!</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benefits Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
                    <Gift className="mr-3 w-8 h-8" />
                    ₹40,000 Worth of Benefits
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm dark:shadow-gray-600/20">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Expert Consultation Booking</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">1-on-1 sessions with industry experts and mentors</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm dark:shadow-gray-600/20">
                        <Download className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Premium Resource Downloads</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Business templates, pitch decks, legal documents & guides</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm dark:shadow-gray-600/20">
                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Dedicated Support Contact</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Direct line to our support team for immediate assistance</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm dark:shadow-gray-600/20">
                        <Gift className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Partner Tools & Credits</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Access to premium software, cloud credits & services</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Contact Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <Mail className="mr-2 w-5 h-5" />
                    📞 Support Contact Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-400">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>brandmindzteam@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>+91-9876543210</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp: +91-9876543210</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Users className="mr-2 w-4 h-4" />
                    Book Consultation
                  </Button>
                  <Button variant="outline" className="border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-6 py-3 font-semibold transition-colors duration-200">
                    <Download className="mr-2 w-4 h-4" />
                    Download Resources
                  </Button>
                  <Button variant="outline" className="border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-6 py-3 font-semibold transition-colors duration-200">
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Contact Support
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approved by <strong className="text-gray-700 dark:text-gray-300">{applicationData?.incubation_centre}</strong> on{' '}
                    {applicationData?.approved_at && new Date(applicationData.approved_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg dark:shadow-gray-700/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-700 dark:text-red-400">Application Not Approved</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Unfortunately, your application was not approved by <strong className="text-gray-900 dark:text-white">{applicationData?.incubation_centre}</strong> at this time.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-medium">Next Steps</p>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  You can contact support for feedback or submit a new application in the future.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📞 Support Contact</h4>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <p>Email: brandmindzteam@gmail.com</p>
                  <p>Phone: +91-9876543210</p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-4 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold transition-colors duration-200">
                <Mail className="mr-2 w-4 h-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default ApplicationSuccess;
