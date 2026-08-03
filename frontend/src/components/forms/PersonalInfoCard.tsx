import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { FormData } from '@/hooks/useSimulationForm';
interface PersonalInfoCardProps {
  formData: FormData;
  inputStates: Record<string, string>;
  errors: Record<string, string>;
  isLoading: boolean;
  onNumberInputChange: (field: keyof FormData, value: string) => void;
  onNumberInputBlur: (field: keyof FormData, value: string) => void;
}
export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  formData,
  inputStates,
  errors,
  isLoading,
  onNumberInputChange,
  onNumberInputBlur
}) => {
  return <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your current age and retirement timeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <InfoTooltip content="Your current age in years. This determines your investment timeline." />
            </div>
            <Input id="currentAge" type="number" value={inputStates.currentAge ?? formData.currentAge} onChange={e => onNumberInputChange('currentAge', e.target.value)} onBlur={e => onNumberInputBlur('currentAge', e.target.value)} className="bg-input border-border" min="18" max="99" disabled={isLoading} aria-describedby="currentAge-error" aria-required="true" />
            {errors.currentAge && <p id="currentAge-error" className="text-destructive text-sm" role="alert">
                {errors.currentAge}
              </p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <InfoTooltip content="The age at which you plan to retire and stop making contributions." />
            </div>
            <Input id="retirementAge" type="number" value={inputStates.retirementAge ?? formData.retirementAge} onChange={e => onNumberInputChange('retirementAge', e.target.value)} onBlur={e => onNumberInputBlur('retirementAge', e.target.value)} className="bg-input border-border" min={formData.currentAge + 1} max="100" disabled={isLoading} aria-describedby="retirementAge-error" aria-required="true" />
            {errors.retirementAge && <p id="retirementAge-error" className="text-destructive text-sm" role="alert">
                {errors.retirementAge}
              </p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Years until Retirement</Label>
          <div className="text-2xl font-bold text-primary">
            {Math.max(0, formData.retirementAge - formData.currentAge)} years
          </div>
        </div>
      </CardContent>
    </Card>;
};