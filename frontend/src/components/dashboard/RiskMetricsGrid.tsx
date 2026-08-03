import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Activity, DollarSign, Target } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { SimulationResponse } from '@/services/simulationApi';

interface RiskMetricsGridProps {
  simulationResults: SimulationResponse;
}

export const RiskMetricsGrid: React.FC<RiskMetricsGridProps> = ({ simulationResults }) => {
  const metrics = [
    {
      title: 'Value at Risk (95%)',
      icon: AlertTriangle,
      value: formatCurrency(simulationResults.summary.var_5),
      description: 'Maximum loss in worst 5% of scenarios',
      tooltip: 'The maximum loss you might expect in the worst 5% of scenarios. This is a measure of downside risk.',
      color: 'text-destructive'
    },
    {
      title: 'Conditional VaR',
      icon: TrendingDown,
      value: formatCurrency(simulationResults.summary.cvar_5),
      description: 'Expected loss in worst 5% of scenarios',
      tooltip: 'The average loss in the worst 5% of scenarios. This shows how bad things could get in extreme downturns.',
      color: 'text-destructive'
    },
    {
      title: 'Portfolio Volatility',
      icon: Activity,
      value: formatPercentage(simulationResults.summary.volatility),
      description: 'Annual portfolio standard deviation',
      tooltip: 'Measures how much your portfolio value fluctuates. Higher volatility means more ups and downs but potentially higher long-term returns.',
      color: 'text-primary'
    },
    {
      title: 'Maximum Drawdown',
      icon: TrendingDown,
      value: `-${formatPercentage(simulationResults.summary.max_drawdown)}`,
      description: 'Largest peak-to-trough decline',
      tooltip: 'The largest peak-to-trough decline during the worst market period. Shows how much your portfolio might fall from its high point.',
      color: 'text-accent-foreground'
    },
    {
      title: 'Median Wealth',
      icon: DollarSign,
      value: formatCurrency(simulationResults.summary.median),
      description: 'Expected portfolio value at retirement',
      tooltip: 'The middle value of all simulation outcomes. Half of scenarios result in more wealth, half in less.',
      color: 'text-primary'
    },
    {
      title: 'Wealth Range (10th-90th)',
      icon: Target,
      value: `${formatCurrency(simulationResults.summary.percentile_10)} to ${formatCurrency(simulationResults.summary.percentile_90)}`,
      description: '80% of scenarios fall within this range',
      tooltip: 'The range covering 80% of all possible outcomes. This gives you a sense of the uncertainty in your retirement planning.',
      color: 'text-accent',
      isRange: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="premium-card border-border/50 hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary text-lg font-semibold">
                <Icon className="h-5 w-5" />
                {metric.title}
                <InfoTooltip content={metric.tooltip} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-foreground mb-2 ${metric.isRange ? 'text-lg' : ''}`}>
                {metric.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};