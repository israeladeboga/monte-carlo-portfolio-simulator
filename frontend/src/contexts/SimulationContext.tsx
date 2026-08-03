
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SimulationResponse } from '@/services/simulationApi';

interface SimulationContextType {
  simulationResults: SimulationResponse | null;
  setSimulationResults: (results: SimulationResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearResults: () => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  resetToForm: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [simulationResults, setSimulationResultsState] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load persisted results on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('lastSimulationResults');
    const savedShowResults = localStorage.getItem('showSimulationResults');
    
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setSimulationResultsState(parsedResults);
        setShowResults(savedShowResults === 'true');
      } catch (error) {
        console.error('Failed to load saved simulation results:', error);
        localStorage.removeItem('lastSimulationResults');
        localStorage.removeItem('showSimulationResults');
      }
    }
  }, []);

  const setSimulationResults = (results: SimulationResponse) => {
    setSimulationResultsState(results);
    setShowResults(true);
    
    // Persist to localStorage
    localStorage.setItem('lastSimulationResults', JSON.stringify(results));
    localStorage.setItem('showSimulationResults', 'true');
  };

  const clearResults = () => {
    setSimulationResultsState(null);
    setShowResults(false);
    setError(null);
    
    // Clear from localStorage
    localStorage.removeItem('lastSimulationResults');
    localStorage.removeItem('showSimulationResults');
  };

  const resetToForm = () => {
    setShowResults(false);
    setError(null);
    
    // Update localStorage to show form
    localStorage.setItem('showSimulationResults', 'false');
  };

  return (
    <SimulationContext.Provider
      value={{
        simulationResults,
        setSimulationResults,
        isLoading,
        setIsLoading,
        error,
        setError,
        clearResults,
        showResults,
        setShowResults,
        resetToForm,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
