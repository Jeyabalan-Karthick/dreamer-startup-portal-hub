
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface StartupIdeaStepProps {
  data: any;
  updateData: (data: any) => void;
  onPrev: () => void;
}

const StartupIdeaStep = ({ data, updateData, onPrev }: StartupIdeaStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expectations = [
    'Funding Support',
    'Mentorship',
    'Network Access',
    'Technical Resources',
    'Marketing Support',
    'Legal Assistance',
    'Office Space',
    'Business Development'
  ];

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleExpectationChange = (expectation: string, checked: boolean) => {
    const currentExpectations = data.expectations || [];
    if (checked) {
      updateData({ expectations: [...currentExpectations, expectation] });
    } else {
      updateData({ expectations: currentExpectations.filter((exp: string) => exp !== expectation) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.ideaDescription || data.ideaDescription.length < 50) {
      toast({
        title: "Missing Information",
        description: "Please provide a detailed description of your startup idea (minimum 50 characters)",
        variant: "destructive",
      });
      return;
    }

    if (!data.expectations || data.expectations.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one expectation from Dreamers",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Final application data:', data);

    // TODO: Submit to Firebase Firestore
    // TODO: Upload files to Firebase Storage
    // TODO: Trigger Firebase Function for email notification

    toast({
      title: "Application Submitted!",
      description: "Your application has been submitted successfully. You will receive an email confirmation shortly.",
    });

    // TODO: Redirect to success page or dashboard
    setIsSubmitting(false);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Startup Idea & Expectations</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ideaDescription" className="text-gray-700">Describe Your Startup Idea *</Label>
            <Textarea
              id="ideaDescription"
              value={data.ideaDescription || ''}
              onChange={(e) => handleInputChange('ideaDescription', e.target.value)}
              className="border-gray-300 min-h-[120px]"
              placeholder="Provide a detailed description of your startup idea, the problem it solves, your target market, and your unique value proposition..."
              required
            />
            <p className="text-sm text-gray-500">
              {data.ideaDescription?.length || 0} characters (minimum 50 required)
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-gray-700">What do you expect from Dreamers? *</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {expectations.map((expectation) => (
                <div key={expectation} className="flex items-center space-x-2">
                  <Checkbox
                    id={expectation}
                    checked={data.expectations?.includes(expectation) || false}
                    onCheckedChange={(checked) => handleExpectationChange(expectation, checked as boolean)}
                  />
                  <Label 
                    htmlFor={expectation} 
                    className="text-sm font-normal text-gray-700 cursor-pointer"
                  >
                    {expectation}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">Select all that apply</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-gray-700">Any Specific Challenges? (Optional)</Label>
            <Textarea
              id="challenges"
              value={data.challenges || ''}
              onChange={(e) => handleInputChange('challenges', e.target.value)}
              className="border-gray-300"
              placeholder="Describe any specific challenges you're facing or areas where you need the most support..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Application Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Founder:</strong> {data.founderName}</p>
              <p><strong>Startup:</strong> {data.startupName}</p>
              <p><strong>Incubation Centre:</strong> {data.incubationCentre}</p>
              <p><strong>Team Size:</strong> {data.teamSize}</p>
              <p><strong>Expectations:</strong> {data.expectations?.length || 0} selected</p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
            >
              Previous
            </Button>
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StartupIdeaStep;
