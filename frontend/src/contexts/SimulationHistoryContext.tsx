
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SimulationResponse } from '@/services/simulationApi';

export interface SimulationHistoryEntry {
  id: string;
  timestamp: Date;
  results: SimulationResponse;
  inputs: {
    age: number;
    retirement_age: number;
    savings: number;
    contribution: number;
    return_rate: number;
    volatility: number;
    goal: number;
    num_simulations: number;
  };
}

export interface SavedResult {
  id: string;
  name: string;
  timestamp: Date;
  results: SimulationResponse;
  inputs: {
    age: number;
    retirement_age: number;
    savings: number;
    contribution: number;
    return_rate: number;
    volatility: number;
    goal: number;
    num_simulations: number;
  };
}

interface SimulationHistoryContextType {
  history: SimulationHistoryEntry[];
  savedResults: SavedResult[];
  addToHistory: (results: SimulationResponse, inputs: any) => string;
  saveResult: (historyId: string, name?: string) => void;
  deleteHistoryEntry: (id: string) => void;
  deleteSavedResult: (id: string) => void;
  updateResultName: (id: string, newName: string) => void;
  clearHistory: () => void;
  getNextAutoName: () => string;
}

const SimulationHistoryContext = createContext<SimulationHistoryContextType | undefined>(undefined);

export const useSimulationHistory = () => {
  const context = useContext(SimulationHistoryContext);
  if (!context) {
    throw new Error('useSimulationHistory must be used within a SimulationHistoryProvider');
  }
  return context;
};

interface SimulationHistoryProviderProps {
  children: ReactNode;
}

export const SimulationHistoryProvider: React.FC<SimulationHistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [autoNameCounter, setAutoNameCounter] = useState<number>(1);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('simulationHistory');
    const savedResultsData = localStorage.getItem('savedSimulationResults');
    const savedCounter = localStorage.getItem('simulationAutoNameCounter');
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading simulation history:', error);
      }
    }
    
    if (savedResultsData) {
      try {
        const parsedSaved = JSON.parse(savedResultsData).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setSavedResults(parsedSaved);
        
        // Calculate the next auto name counter based on existing saved results
        const defaultNameNumbers = parsedSaved
          .filter((result: SavedResult) => result.name.match(/^Simulation \d+$/))
          .map((result: SavedResult) => parseInt(result.name.replace('Simulation ', '')))
          .filter((num: number) => !isNaN(num));
        
        const maxNumber = defaultNameNumbers.length > 0 ? Math.max(...defaultNameNumbers) : 0;
        setAutoNameCounter(maxNumber + 1);
      } catch (error) {
        console.error('Error loading saved results:', error);
      }
    }
    
    if (savedCounter) {
      try {
        const counter = parseInt(savedCounter);
        if (!isNaN(counter)) {
          setAutoNameCounter(counter);
        }
      } catch (error) {
        console.error('Error loading auto name counter:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('simulationHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('savedSimulationResults', JSON.stringify(savedResults));
  }, [savedResults]);

  useEffect(() => {
    localStorage.setItem('simulationAutoNameCounter', autoNameCounter.toString());
  }, [autoNameCounter]);

  const getNextAutoName = (): string => {
    return `Simulation ${autoNameCounter}`;
  };

  const addToHistory = (results: SimulationResponse, inputs: any): string => {
    const newEntry: SimulationHistoryEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      results,
      inputs
    };
    
    setHistory(prev => [newEntry, ...prev].slice(0, 100)); // Keep last 100 entries
    return newEntry.id;
  };

  const saveResult = (historyId: string, name?: string) => {
    const historyEntry = history.find(entry => entry.id === historyId);
    if (!historyEntry) return;

    const isCustomName = name && name.trim() !== '';
    const finalName = isCustomName ? name.trim() : getNextAutoName();

    const savedResult: SavedResult = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: finalName,
      timestamp: historyEntry.timestamp,
      results: historyEntry.results,
      inputs: historyEntry.inputs
    };
    
    setSavedResults(prev => [savedResult, ...prev]);
    
    // Only increment counter if using auto-generated name
    if (!isCustomName) {
      setAutoNameCounter(prev => prev + 1);
    }
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const deleteSavedResult = (id: string) => {
    setSavedResults(prev => prev.filter(result => result.id !== id));
  };

  const updateResultName = (id: string, newName: string) => {
    setSavedResults(prev => prev.map(result => 
      result.id === id ? { ...result, name: newName } : result
    ));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <SimulationHistoryContext.Provider
      value={{
        history,
        savedResults,
        addToHistory,
        saveResult,
        deleteHistoryEntry,
        deleteSavedResult,
        updateResultName,
        clearHistory,
        getNextAutoName,
      }}
    >
      {children}
    </SimulationHistoryContext.Provider>
  );
};
