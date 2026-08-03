
import React from 'react';
import { useSimulation } from '@/contexts/SimulationContext';
import SimulationForm from '@/components/SimulationForm';
import ResultsDashboard from '@/components/ResultsDashboard';

const Simulate = () => {
  const { showResults } = useSimulation();

  return (
    <div className="transition-all duration-300 ease-in-out">
      {showResults ? <ResultsDashboard /> : <SimulationForm />}
    </div>
  );
};

export default Simulate;
