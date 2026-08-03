import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { getRiskToleranceDescription } from '@/lib/utils';
import { FormData } from '@/hooks/useSimulationForm';

interface InvestmentParametersCardProps {
  formData: FormData;
  errors: Record<string, string>;
  isLoading: boolean;
  onUpdateFormData: (updates: Partial<FormData>) => void;
}

export const InvestmentParametersCard: React.FC<InvestmentParametersCardProps> = ({
  formData,
  errors,
  isLoading,
  onUpdateFormData,
}) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          Investment Parameters
        </CardTitle>
        <CardDescription>
          Expected returns and risk preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Expected Annual Return: {formData.expectedReturn}%</Label>
            <InfoTooltip content="Historical stock market returns average 7-10% annually. Consider your asset allocation when setting this." />
          </div>
          <Slider
            value={[formData.expectedReturn]}
            onValueChange={(value) => onUpdateFormData({ expectedReturn: value[0] })}
            max={20}
            min={1}
            step={0.1}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Conservative (1%)</span>
            <span>Aggressive (20%)</span>
          </div>
          {errors.expectedReturn && (
            <p className="text-destructive text-sm">{errors.expectedReturn}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Risk Tolerance</Label>
            <InfoTooltip content="Your comfort level with portfolio volatility. Higher risk tolerance may lead to higher long-term returns but with more ups and downs." />
          </div>
          <Select 
            value={formData.riskTolerance} 
            onValueChange={(value) => onUpdateFormData({ riskTolerance: value })}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="conservative">Conservative (8% volatility)</SelectItem>
              <SelectItem value="moderate">Moderate (15% volatility)</SelectItem>
              <SelectItem value="aggressive">Aggressive (22% volatility)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{getRiskToleranceDescription(formData.riskTolerance)}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Inflation Rate: {formData.inflationRate}%</Label>
            <InfoTooltip content="Expected annual inflation rate. Historical average is around 2-3%. This affects the real purchasing power of your savings." />
          </div>
          <Slider
            value={[formData.inflationRate]}
            onValueChange={(value) => onUpdateFormData({ inflationRate: value[0] })}
            max={8}
            min={0}
            step={0.1}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>No Inflation (0%)</span>
            <span>High Inflation (8%)</span>
          </div>
          {errors.inflationRate && (
            <p className="text-destructive text-sm">{errors.inflationRate}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};