
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface IncubationInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const IncubationInfoStep = ({ data, updateData, onNext, onPrev }: IncubationInfoStepProps) => {
  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    updateData({ [field]: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.incubationCentre) {
      toast({
        title: "Missing Information",
        description: "Please select an incubation centre",
        variant: "destructive",
      });
      return;
    }

    console.log('Step 2 data:', data);
    onNext();
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Incubation Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-700">Select Incubation Centre *</Label>
            <Select value={data.incubationCentre || ''} onValueChange={(value) => handleInputChange('incubationCentre', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Choose your preferred incubation centre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dreamers-mumbai">Dreamers Mumbai</SelectItem>
                <SelectItem value="dreamers-delhi">Dreamers Delhi</SelectItem>
                <SelectItem value="dreamers-bangalore">Dreamers Bangalore</SelectItem>
                <SelectItem value="dreamers-pune">Dreamers Pune</SelectItem>
                <SelectItem value="dreamers-hyderabad">Dreamers Hyderabad</SelectItem>
                <SelectItem value="dreamers-tirunelveli">Dreamers Tirunelveli</SelectItem>
                <SelectItem value="startup-tvl">STARTUP TVL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="registrationCertificate" className="text-gray-700">Registration Certificate *</Label>
              <Input
                id="registrationCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('registrationCertificate', e.target.files?.[0] || null)}
                className="border-gray-300"
                required
              />
              <p className="text-sm text-gray-500">PDF, JPG, or PNG format (Max 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incubationLetter" className="text-gray-700">Incubation Letter (Optional)</Label>
              <Input
                id="incubationLetter"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('incubationLetter', e.target.files?.[0] || null)}
                className="border-gray-300"
              />
              <p className="text-sm text-gray-500">If available from previous incubations</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-700">Website / Social Profile (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={data.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="border-gray-300"
              placeholder="https://your-website.com or social media profile"
            />
            <p className="text-sm text-gray-500">Your website, LinkedIn, or any relevant online presence</p>
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
            >
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncubationInfoStep;
