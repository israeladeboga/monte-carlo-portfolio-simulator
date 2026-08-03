import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { SimulationResponse } from '@/services/simulationApi';
import { formatCurrency, formatPercentage, getFinancialInsight } from '@/lib/utils';
interface SummaryInsightProps {
  simulationResults: SimulationResponse;
}
export const SummaryInsight: React.FC<SummaryInsightProps> = ({
  simulationResults
}) => {
  const goalProbability = simulationResults.summary.goal_probability;
  const financialInsight = getFinancialInsight(goalProbability);
  return <Card className="mb-8 premium-card border-primary/20 bg-gradient-to-r from-primary-light to-secondary-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-semibold text-xl">
          <Info className="h-6 w-6" />
          Key Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">
              Goal Success Probability: {formatPercentage(goalProbability)}
            </h3>
            <p className="text-foreground mb-4 leading-relaxed">{financialInsight}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Wealth (Median):</span>
              <span className="font-semibold text-zinc-800">{formatCurrency(simulationResults.summary.median)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Case (90th percentile):</span>
              <span className="font-semibold text-zinc-800">{formatCurrency(simulationResults.summary.percentile_90)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Worst Case (10th percentile):</span>
              <span className="font-semibold text-zinc-800">{formatCurrency(simulationResults.summary.percentile_10)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};