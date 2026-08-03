
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimulationResponse } from '@/services/simulationApi';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SimulationComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    results: SimulationResponse;
    inputs: any;
  }>;
  onRemoveScenario: (id: string) => void;
  onSelectScenario: (id: string) => void;
}

export const SimulationComparison = ({ scenarios, onRemoveScenario, onSelectScenario }: SimulationComparisonProps) => {
  if (scenarios.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Scenario Comparison</CardTitle>
          <CardDescription className="text-slate-400">
            Run multiple simulations to compare different strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">No scenarios saved yet. Run a simulation and save it to start comparing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-blue-400">Scenario Comparison</CardTitle>
        <CardDescription className="text-slate-400">
          Compare different retirement strategies side by side
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="border border-slate-600 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-white">{scenario.name}</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectScenario(scenario.id)}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveScenario(scenario.id)}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Goal Probability</p>
                  <p className="font-semibold text-green-400">
                    {(scenario.results.summary.goal_probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Median Wealth</p>
                  <p className="font-semibold text-white">
                    {formatCurrency(scenario.results.summary.median)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Max Drawdown</p>
                  <p className="font-semibold text-red-400">
                    -{(scenario.results.summary.max_drawdown * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Volatility</p>
                  <p className="font-semibold text-purple-400">
                    {(scenario.results.summary.volatility * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
