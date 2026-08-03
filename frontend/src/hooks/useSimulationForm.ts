import { useState, useCallback, useMemo } from 'react';
import { useSimulation } from '@/contexts/SimulationContext';
import { runSimulation, SimulationRequest } from '@/services/simulationApi';
import { useToast } from '@/hooks/use-toast';
import { validateFinancialInput } from '@/lib/utils';
import { useDebounce } from './useDebounce';

export interface FormData {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualContribution: number;
  expectedReturn: number;
  riskTolerance: string;
  wealthGoal: number;
  inflationRate: number;
}

const initialFormData: FormData = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  annualContribution: 15000,
  expectedReturn: 7.5,
  riskTolerance: 'moderate',
  wealthGoal: 1000000,
  inflationRate: 2.5
};

export const useSimulationForm = () => {
  const { toast } = useToast();
  const { setSimulationResults, isLoading, setIsLoading, setError } = useSimulation();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inputStates, setInputStates] = useState<Record<string, string>>({});
  
  // Debounce validation to improve performance during typing
  const debouncedFormData = useDebounce(formData, 300);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const ageError = validateFinancialInput(formData.currentAge, 18, 99);
    if (ageError) newErrors.currentAge = ageError;
    else if (formData.currentAge >= 99) newErrors.currentAge = 'Please enter a realistic current age';

    if (formData.retirementAge <= formData.currentAge) {
      newErrors.retirementAge = 'Retirement age must be greater than current age';
    } else if (formData.retirementAge > 100) {
      newErrors.retirementAge = 'Please enter a realistic retirement age';
    }

    const savingsError = validateFinancialInput(formData.currentSavings, 0, 100000000);
    if (savingsError) newErrors.currentSavings = savingsError;

    const contributionError = validateFinancialInput(formData.annualContribution, 0, 1000000);
    if (contributionError) newErrors.annualContribution = contributionError;

    if (formData.expectedReturn <= 0 || formData.expectedReturn > 30) {
      newErrors.expectedReturn = 'Expected return must be between 0.1% and 30%';
    }

    const goalError = validateFinancialInput(formData.wealthGoal, 1000, 1000000000);
    if (goalError) newErrors.wealthGoal = goalError;

    if (formData.inflationRate < 0 || formData.inflationRate > 15) {
      newErrors.inflationRate = 'Inflation rate must be between 0% and 15%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const getRiskVolatility = useCallback((riskTolerance: string): number => {
    switch (riskTolerance) {
      case 'conservative': return 0.08;
      case 'moderate': return 0.15;
      case 'aggressive': return 0.22;
      default: return 0.15;
    }
  }, []);

  const handleNumberInputChange = useCallback((field: keyof FormData, value: string) => {
    setInputStates(prev => ({ ...prev, [field]: value }));
    
    if (value !== '' && !isNaN(Number(value))) {
      const numValue = Number(value);
      setFormData(prev => ({ ...prev, [field]: numValue }));
    }
  }, []);

  const handleNumberInputBlur = useCallback((field: keyof FormData, value: string) => {
    if (value === '' || isNaN(Number(value))) {
      setFormData(prev => ({ ...prev, [field]: 0 }));
      setInputStates(prev => ({ ...prev, [field]: '0' }));
    } else {
      setInputStates(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiRequest: SimulationRequest = {
        age: formData.currentAge,
        retirement_age: formData.retirementAge,
        savings: formData.currentSavings,
        contribution: formData.annualContribution,
        return_rate: formData.expectedReturn / 100,
        volatility: getRiskVolatility(formData.riskTolerance),
        risk_tolerance: formData.riskTolerance,
        inflation_rate: formData.inflationRate / 100,
        wealth_goal: formData.wealthGoal,
        num_simulations: 10000
      };

      const results = await runSimulation(apiRequest);
      setSimulationResults(results);
      
      toast({
        title: "Simulation Complete",
        description: "Your retirement simulation has been successfully calculated.",
      });
      
    } catch (error) {
      console.error('Simulation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Simulation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, getRiskVolatility, setSimulationResults, setIsLoading, setError, toast]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 &&
           formData.currentAge > 0 && 
           formData.retirementAge > formData.currentAge && 
           formData.currentSavings >= 0 && 
           formData.annualContribution >= 0 && 
           formData.expectedReturn > 0 && 
           formData.wealthGoal > 0 &&
           formData.inflationRate >= 0;
  }, [formData, errors]);

  return {
    formData,
    errors,
    inputStates,
    isLoading,
    handleNumberInputChange,
    handleNumberInputBlur,
    updateFormData,
    submitForm,
    isFormValid,
  };
};