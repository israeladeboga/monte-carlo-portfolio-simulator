import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSimulationForm } from '@/hooks/useSimulationForm';
import { PersonalInfoCard } from '@/components/forms/PersonalInfoCard';
import { FinancialInfoCard } from '@/components/forms/FinancialInfoCard';
import { InvestmentParametersCard } from '@/components/forms/InvestmentParametersCard';

const SimulationForm = () => {
  const {
    formData,
    errors,
    inputStates,
    isLoading,
    handleNumberInputChange,
    handleNumberInputBlur,
    updateFormData,
    submitForm,
    isFormValid,
  } = useSimulationForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quantified Financial Futures
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Model your financial future using Monte Carlo simulations. Understand your retirement readiness and portfolio risks through advanced statistical modeling.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalInfoCard
              formData={formData}
              inputStates={inputStates}
              errors={errors}
              isLoading={isLoading}
              onNumberInputChange={handleNumberInputChange}
              onNumberInputBlur={handleNumberInputBlur}
            />

            <FinancialInfoCard
              formData={formData}
              inputStates={inputStates}
              errors={errors}
              isLoading={isLoading}
              onNumberInputChange={handleNumberInputChange}
              onNumberInputBlur={handleNumberInputBlur}
            />

            <InvestmentParametersCard
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              onUpdateFormData={updateFormData}
            />

            {/* Quick Tips Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-primary">Emergency Fund:</span> Keep 3-6 months of expenses separate from retirement savings.
                </div>
                <div>
                  <span className="font-semibold text-accent">Employer Match:</span> Always contribute enough to get the full employer 401(k) match - it's free money!
                </div>
                <div>
                  <span className="font-semibold text-primary">Asset Allocation:</span> Younger investors can typically handle more aggressive portfolios for higher long-term returns.
                </div>
                <div>
                  <span className="font-semibold text-secondary">Time Horizon:</span> The longer your investment timeline, the more market volatility works in your favor.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Section */}
          <div className="text-center space-y-4">
            {Object.keys(errors).length > 0 && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive">
                  Please fix the errors above before running the simulation.
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:from-muted disabled:to-muted text-primary-foreground font-semibold py-3 px-8 rounded-xl text-lg min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-5 w-5" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-5 w-5" />
                  Run Monte Carlo Simulation
                </>
              )}
            </Button>
            
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              This simulation will analyze {formData.retirementAge - formData.currentAge} years of portfolio growth using 10,000 random scenarios to model market uncertainty.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimulationForm;