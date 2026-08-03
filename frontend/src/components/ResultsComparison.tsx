
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Target, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { SavedResult } from '@/contexts/SimulationHistoryContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface ResultsComparisonProps {
  results: SavedResult[];
  onClose: () => void;
}

export const ResultsComparison: React.FC<ResultsComparisonProps> = ({ results, onClose }) => {
  const metrics = [
    { key: 'goal_probability', label: 'Success Probability', format: formatPercentage, tooltip: 'Probability of meeting your retirement goal', icon: Target },
    { key: 'median', label: 'Median Wealth', format: formatCurrency, tooltip: 'Expected portfolio value at retirement', icon: TrendingUp },
    { key: 'percentile_10', label: '10th Percentile', format: formatCurrency, tooltip: 'Worst-case scenario (bottom 10%)', icon: AlertTriangle },
    { key: 'percentile_90', label: '90th Percentile', format: formatCurrency, tooltip: 'Best-case scenario (top 10%)', icon: TrendingUp },
    { key: 'volatility', label: 'Volatility', format: formatPercentage, tooltip: 'Annual portfolio standard deviation', icon: Activity },
    { key: 'max_drawdown', label: 'Max Drawdown', format: (v: number) => `-${formatPercentage(v)}`, tooltip: 'Largest peak-to-trough decline', icon: AlertTriangle },
    { key: 'var_5', label: 'Value at Risk (95%)', format: formatCurrency, tooltip: 'Maximum loss in worst 5% of scenarios', icon: AlertTriangle },
    { key: 'cvar_5', label: 'Conditional VaR', format: formatCurrency, tooltip: 'Average loss in worst 5% of scenarios', icon: AlertTriangle },
  ];

  // Professional color palette
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

  // Process wealth projection data for each result
  const processWealthData = (result: SavedResult) => {
    return Object.entries(result.results.wealth_percentiles || {})
      .map(([yearKey, data]) => {
        const year = parseInt(yearKey.replace('year_', ''));
        return {
          year,
          p10: data.p10,
          p50: data.p50,
          p90: data.p90,
        };
      })
      .sort((a, b) => a.year - b.year);
  };

  const allWealthData = results.map((result, index) => ({
    name: result.name,
    data: processWealthData(result),
    color: colors[index % colors.length],
    index
  }));

  // Combine all data points for the chart
  const combinedWealthData = allWealthData[0]?.data.map((_, index) => {
    const yearData: any = { year: allWealthData[0].data[index].year };
    allWealthData.forEach((result) => {
      yearData[`p10_${result.index}`] = result.data[index]?.p10 || 0;
      yearData[`p50_${result.index}`] = result.data[index]?.p50 || 0;
      yearData[`p90_${result.index}`] = result.data[index]?.p90 || 0;
    });
    return yearData;
  }) || [];

  const chartConfig = allWealthData.reduce((acc, result) => {
    acc[`p10_${result.index}`] = { label: `${result.name} (10th)`, color: result.color };
    acc[`p50_${result.index}`] = { label: `${result.name} (Median)`, color: result.color };
    acc[`p90_${result.index}`] = { label: `${result.name} (90th)`, color: result.color };
    return acc;
  }, {} as any);

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-6 mt-4 p-4 bg-slate-800/30 rounded-lg">
        {allWealthData.map((result) => (
          <div key={result.index} className="flex flex-col items-center gap-2">
            <div className="font-medium text-white text-sm">{result.name}</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-0.5 border-dotted border-t-2" 
                  style={{ borderColor: result.color }}
                />
                <span className="text-slate-400">10th</span>
              </div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-0.5 bg-current" 
                  style={{ backgroundColor: result.color }}
                />
                <span className="text-slate-400">Median</span>
              </div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-0.5 border-dashed border-t-2" 
                  style={{ borderColor: result.color }}
                />
                <span className="text-slate-400">90th</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-950 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Scenario Comparison
            </h1>
            <p className="text-slate-300">Comparing {results.length} simulation scenarios</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Wealth Projection Chart */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <TrendingUp className="h-5 w-5" />
                Wealth Projection Comparison
              </CardTitle>
              <CardDescription className="text-slate-400">
                Portfolio growth scenarios over time - showing 10th percentile (dotted), median (solid), and 90th percentile (dashed) for each simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-96 w-full">
                <LineChart data={combinedWealthData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9ca3af"
                    fontSize={12}
                    label={{ value: 'Years from Now', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name) => [formatCurrency(Number(value)), chartConfig[name as string]?.label || name]}
                      labelFormatter={(value) => `Year ${value}`}
                    />} 
                  />
                  {allWealthData.map((result) => (
                    <React.Fragment key={result.index}>
                      {/* 10th Percentile - Dotted */}
                      <Line 
                        type="monotone" 
                        dataKey={`p10_${result.index}`} 
                        stroke={result.color} 
                        strokeWidth={2}
                        strokeDasharray="2 4"
                        dot={false}
                        name={`${result.name} (10th)`}
                      />
                      {/* Median - Solid */}
                      <Line 
                        type="monotone" 
                        dataKey={`p50_${result.index}`} 
                        stroke={result.color} 
                        strokeWidth={3}
                        dot={false}
                        name={`${result.name} (Median)`}
                      />
                      {/* 90th Percentile - Dashed */}
                      <Line 
                        type="monotone" 
                        dataKey={`p90_${result.index}`} 
                        stroke={result.color} 
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        dot={false}
                        name={`${result.name} (90th)`}
                      />
                    </React.Fragment>
                  ))}
                </LineChart>
              </ChartContainer>
              <CustomLegend />
            </CardContent>
          </Card>

          {/* Metrics Comparison Table */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Metrics Comparison</CardTitle>
              <CardDescription className="text-slate-400">
                Side-by-side comparison of key financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-slate-300">Metric</th>
                      {results.map((result) => (
                        <th key={result.id} className="text-left p-4">
                          <div className="text-white font-medium">{result.name}</div>
                          <div className="text-sm text-slate-400">
                            {result.timestamp.toLocaleDateString()}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.key} className="border-b border-slate-800 hover:bg-slate-900/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-300">{metric.label}</span>
                            <InfoTooltip content={metric.tooltip} />
                          </div>
                        </td>
                        {results.map((result) => (
                          <td key={result.id} className="p-4 text-white font-medium">
                            {metric.format((result.results.summary as any)[metric.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Input Parameters Comparison */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Input Parameters</CardTitle>
              <CardDescription className="text-slate-400">
                Comparison of simulation input parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-slate-300">Parameter</th>
                      {results.map((result) => (
                        <th key={result.id} className="text-left p-4 text-white font-medium">
                          {result.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Age Range</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {result.inputs.age} → {result.inputs.retirement_age}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Initial Savings</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {formatCurrency(result.inputs.savings)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Annual Contribution</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {formatCurrency(result.inputs.contribution)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Expected Return</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {formatPercentage(result.inputs.return_rate)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Volatility</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {formatPercentage(result.inputs.volatility)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-slate-300">Retirement Goal</td>
                      {results.map((result) => (
                        <td key={result.id} className="p-4 text-white">
                          {formatCurrency(result.inputs.goal)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
