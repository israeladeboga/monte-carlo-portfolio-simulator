import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatCurrency } from '@/lib/utils';
import { FormData } from '@/hooks/useSimulationForm';

interface FinancialInfoCardProps {
  formData: FormData;
  inputStates: Record<string, string>;
  errors: Record<string, string>;
  isLoading: boolean;
  onNumberInputChange: (field: keyof FormData, value: string) => void;
  onNumberInputBlur: (field: keyof FormData, value: string) => void;
}

export const FinancialInfoCard: React.FC<FinancialInfoCardProps> = ({
  formData,
  inputStates,
  errors,
  isLoading,
  onNumberInputChange,
  onNumberInputBlur,
}) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5" />
          Financial Information
        </CardTitle>
        <CardDescription>
          Your current savings and contribution plans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="currentSavings">Current Savings</Label>
            <InfoTooltip content="Total amount you currently have saved for retirement across all accounts." />
          </div>
          <Input
            id="currentSavings"
            type="number"
            value={inputStates.currentSavings ?? formData.currentSavings}
            onChange={(e) => onNumberInputChange('currentSavings', e.target.value)}
            onBlur={(e) => onNumberInputBlur('currentSavings', e.target.value)}
            className="bg-input border-border"
            min="0"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">{formatCurrency(formData.currentSavings)}</p>
          {errors.currentSavings && (
            <p className="text-destructive text-sm">{errors.currentSavings}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="annualContribution">Annual Contribution</Label>
            <InfoTooltip content="Amount you plan to contribute to retirement savings each year, including employer matches." />
          </div>
          <Input
            id="annualContribution"
            type="number"
            value={inputStates.annualContribution ?? formData.annualContribution}
            onChange={(e) => onNumberInputChange('annualContribution', e.target.value)}
            onBlur={(e) => onNumberInputBlur('annualContribution', e.target.value)}
            className="bg-input border-border"
            min="0"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">{formatCurrency(formData.annualContribution)} per year</p>
          {errors.annualContribution && (
            <p className="text-destructive text-sm">{errors.annualContribution}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="wealthGoal">Retirement Wealth Goal</Label>
            <InfoTooltip content="Target amount you want to have saved by retirement. Consider 25x your annual expenses as a starting point." />
          </div>
          <Input
            id="wealthGoal"
            type="number"
            value={inputStates.wealthGoal ?? formData.wealthGoal}
            onChange={(e) => onNumberInputChange('wealthGoal', e.target.value)}
            onBlur={(e) => onNumberInputBlur('wealthGoal', e.target.value)}
            className="bg-input border-border"
            min="1000"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">{formatCurrency(formData.wealthGoal)}</p>
          {errors.wealthGoal && (
            <p className="text-destructive text-sm">{errors.wealthGoal}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};