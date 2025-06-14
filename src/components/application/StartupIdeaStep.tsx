
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ApplicationSuccess from './ApplicationSuccess';

interface StartupIdeaStepProps {
  data: any;
  updateData: (data: any) => void;
  onPrev: () => void;
}

const StartupIdeaStep = ({ data, updateData, onPrev }: StartupIdeaStepProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const expectationOptions = [
    'Funding Support',
    'Mentorship',
    'Office Space',
    'Networking Opportunities',
    'Legal Support',
    'Marketing Support',
    'Technical Support',
    'Business Development'
  ];

  const handleExpectationChange = (expectation: string, checked: boolean) => {
    const currentExpectations = data.expectations || [];
    if (checked) {
      updateData({ expectations: [...currentExpectations, expectation] });
    } else {
      updateData({ expectations: currentExpectations.filter((e: string) => e !== expectation) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.ideaDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe your startup idea",
        variant: "destructive",
      });
      return;
    }

    if (!data.expectations || data.expectations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one expectation",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: applicationData, error } = await supabase
        .from('applications')
        .insert([{
          founder_name: data.founderName,
          startup_name: data.startupName,
          email: data.email,
          phone: data.phone,
          company_type: data.companyType,
          team_size: data.teamSize,
          source: data.source,
          coupon_code: data.couponCode,
          incubation_centre: data.incubationCentre,
          registration_certificate_url: data.registrationCertificate,
          incubation_letter_url: data.incubationLetter,
          website: data.website,
          idea_description: data.ideaDescription,
          expectations: data.expectations,
          challenges: data.challenges,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Application submitted successfully:', applicationData);
      
      // Send email notification to admin
      const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
        body: { applicationId: applicationData.id }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the submission if email fails
      }

      setApplicationId(applicationData.id);
      setSubmitted(true);
      
      toast({
        title: "Success",
        description: "Application submitted successfully! Admin has been notified.",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show success component if submitted
  if (submitted && applicationId) {
    return <ApplicationSuccess applicationId={applicationId} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Startup Idea & Expectations</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="ideaDescription">Describe your startup idea *</Label>
            <Textarea
              id="ideaDescription"
              placeholder="Tell us about your startup idea, the problem you're solving, and your solution..."
              value={data.ideaDescription}
              onChange={(e) => updateData({ ideaDescription: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label className="text-base font-medium">What do you expect from the incubation program? *</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {expectationOptions.map((expectation) => (
                <div key={expectation} className="flex items-center space-x-2">
                  <Checkbox
                    id={expectation}
                    checked={data.expectations?.includes(expectation) || false}
                    onCheckedChange={(checked) => handleExpectationChange(expectation, checked as boolean)}
                  />
                  <Label htmlFor={expectation} className="text-sm font-normal">
                    {expectation}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="challenges">What challenges are you currently facing? (Optional)</Label>
            <Textarea
              id="challenges"
              placeholder="Tell us about any challenges you're facing in your startup journey..."
              value={data.challenges}
              onChange={(e) => updateData({ challenges: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StartupIdeaStep;
