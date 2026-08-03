import React, { useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatCurrency } from '@/lib/utils';
import { SimulationResponse } from '@/services/simulationApi';

interface WealthProjectionChartProps {
  simulationResults: SimulationResponse;
}

export const WealthProjectionChart: React.FC<WealthProjectionChartProps> = memo(({ simulationResults }) => {
  const chartData = useMemo(() => {
    if (!simulationResults.wealth_percentiles) return [];
    
    return Object.entries(simulationResults.wealth_percentiles)
      .map(([yearKey, data]) => {
        const year = parseInt(yearKey.replace('year_', ''));
        return {
          year: year,
          median: data.p50,
          p10: data.p10,
          p90: data.p90,
        };
      })
      .sort((a, b) => a.year - b.year);
  }, [simulationResults.wealth_percentiles]);

  const formatTooltipValue = useCallback((value: number, name: string) => [
    formatCurrency(value), name
  ], []);

  const formatYAxisTick = useCallback((value: number) => 
    `$${(value/1000000).toFixed(1)}M`
  , []);

  const chartConfig = {
    median: {
      label: "Median Path",
      color: "hsl(var(--primary))",
    },
    p10: {
      label: "10th Percentile",
      color: "hsl(var(--destructive))",
    },
    p90: {
      label: "90th Percentile", 
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card className="premium-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-semibold">
          <TrendingUp className="h-5 w-5" />
          Wealth Projection Paths
          <InfoTooltip content="Shows how your portfolio might grow over time. The median path is most likely, while the bands show the range of possible outcomes." />
        </CardTitle>
        <CardDescription className="text-muted-foreground font-medium">
          Portfolio growth scenarios over time (10th, 50th, and 90th percentiles)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="year" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Years from Now', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatYAxisTick}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={formatTooltipValue}
                labelFormatter={(value) => `Year ${value}`}
              />} 
            />
            <Line 
              type="monotone" 
              dataKey="p10" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={false}
              name="10th Percentile"
            />
            <Line 
              type="monotone" 
              dataKey="median" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={false}
              name="Median Path"
            />
            <Line 
              type="monotone" 
              dataKey="p90" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={false}
              name="90th Percentile"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});