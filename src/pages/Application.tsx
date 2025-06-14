
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FounderDetailsStep from '../components/application/FounderDetailsStep';
import IncubationInfoStep from '../components/application/IncubationInfoStep';
import StartupIdeaStep from '../components/application/StartupIdeaStep';

const Application = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    // Step 1: Founder Details
    founderName: '',
    startupName: '',
    email: '',
    phone: '',
    companyType: '',
    teamSize: '',
    source: '',
    couponCode: '',
    
    // Step 2: Incubation Info
    incubationCentre: '',
    registrationCertificate: null,
    incubationLetter: null,
    website: '',
    
    // Step 3: Startup Idea
    ideaDescription: '',
    expectations: [],
    challenges: ''
  });

  const steps = [
    { number: 1, title: 'Founder Details', description: 'Basic information about you and your startup' },
    { number: 2, title: 'Incubation Info', description: 'Documents and incubation center details' },
    { number: 3, title: 'Startup Idea', description: 'Your vision and expectations' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const updateApplicationData = (data: any) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FounderDetailsStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <IncubationInfoStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StartupIdeaStep
            data={applicationData}
            updateData={updateApplicationData}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Application</h1>
          <p className="text-gray-600">Complete your application for the Dreamers Incubation Program</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-gray-200">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step) => (
                <div key={step.number} className="flex-1 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                    step.number <= currentStep 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-xs">
                    <div className={`font-medium ${step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Application;
