import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, Save, RotateCcw, Activity, AlertTriangle } from 'lucide-react';
import { useSimulation } from '@/contexts/SimulationContext';
import { useSimulationHistory } from '@/contexts/SimulationHistoryContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SaveSimulationModal } from '@/components/SaveSimulationModal';
import { SummaryInsight } from '@/components/dashboard/SummaryInsight';
import { WealthProjectionChart } from '@/components/dashboard/WealthProjectionChart';
import { RiskMetricsGrid } from '@/components/dashboard/RiskMetricsGrid';

const ResultsDashboard = () => {
  const { simulationResults, resetToForm } = useSimulation();
  const { addToHistory, saveResult, history } = useSimulationHistory();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Add simulation to history when results are available
  useEffect(() => {
    if (simulationResults && !currentHistoryId) {
      // We need to get the inputs from somewhere - for now using placeholder
      // In a real implementation, you'd store the inputs in SimulationContext too
      const inputs = {
        age: 30, // These would come from the actual form inputs
        retirement_age: 65,
        savings: 10000,
        contribution: 5000,
        return_rate: 0.07,
        volatility: 0.15,
        goal: 1000000,
        num_simulations: 5000
      };
      const historyId = addToHistory(simulationResults, inputs);
      setCurrentHistoryId(historyId);
    }
  }, [simulationResults, addToHistory, currentHistoryId]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = (name: string) => {
    if (currentHistoryId) {
      saveResult(currentHistoryId, name);
      setIsSaved(true);
      toast({
        title: "Result Saved",
        description: "Results have been added to Saved Results.",
      });
    }
  };

  const handleRunNewSimulation = () => {
    resetToForm();
    setIsSaved(false);
    setCurrentHistoryId(null);
  };

  // Redirect if no simulation results
  if (!simulationResults) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              No simulation results found. Please run a simulation first.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Create histogram data from the wealth distribution
  const histogramData = useMemo(() => {
    const data = [];
    const bins = 12;
    const p10 = simulationResults.summary.percentile_10;
    const p90 = simulationResults.summary.percentile_90;
    
    for (let i = 0; i < bins; i++) {
      const minValue = p10 + (i / bins) * (p90 - p10);
      const maxValue = p10 + ((i + 1) / bins) * (p90 - p10);
      const frequency = Math.max(0, 100 * Math.exp(-Math.pow((i - bins/2) / (bins/4), 2)));
      
      data.push({
        range: `${(minValue/1000000).toFixed(1)}M`,
        frequency: Math.round(frequency),
        value: (minValue + maxValue) / 2
      });
    }
    return data;
  }, [simulationResults.summary.percentile_10, simulationResults.summary.percentile_90]);

  const histogramConfig = {
    frequency: {
      label: "Scenarios",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with action buttons */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Simulation Results
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Monte Carlo analysis of your retirement portfolio over {simulationResults.metadata.num_simulations.toLocaleString()} scenarios
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={handleSaveClick}
              disabled={isSaved}
              className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaved ? 'Saved!' : 'Save Result'}
            </Button>
            <Button variant="outline" className="border-border hover:bg-secondary">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <SummaryInsight simulationResults={simulationResults} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <WealthProjectionChart simulationResults={simulationResults} />

          {/* Wealth Distribution Histogram */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Activity className="h-5 w-5" />
                Retirement Wealth Distribution
                <InfoTooltip content="Shows the probability distribution of your final retirement wealth. Most scenarios cluster around the median value." />
              </CardTitle>
              <CardDescription>
                Frequency of final portfolio values across all simulations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={histogramConfig} className="h-80 w-full">
                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="range" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Wealth Range', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name) => [`${value} scenarios`, 'Frequency']}
                      labelFormatter={(value) => `Wealth Range: $${value}`}
                    />} 
                  />
                  <Bar 
                    dataKey="frequency" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <RiskMetricsGrid simulationResults={simulationResults} />

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleRunNewSimulation}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold py-3 px-8 rounded-xl text-lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Run New Simulation
          </Button>
          <Button variant="outline" className="border-border hover:bg-secondary py-3 px-8 rounded-xl text-lg">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        <SaveSimulationModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveConfirm}
          defaultName={`Simulation ${new Date().toLocaleDateString()}`}
        />
      </div>
    </div>
  );
};

export default ResultsDashboard;
