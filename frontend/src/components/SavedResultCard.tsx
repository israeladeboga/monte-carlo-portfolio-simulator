import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { SavedResult } from '@/contexts/SimulationHistoryContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SavedResultCardProps {
  result: SavedResult;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: () => void;
  canSelect: boolean;
  isEditingName: boolean;
  newName: string;
  onNameEdit: (name: string) => void;
  onNameSave: () => void;
  onNameCancel: () => void;
  onNameChange: (name: string) => void;
}

const SavedResultCard: React.FC<SavedResultCardProps> = ({ 
  result, 
  isSelected, 
  onSelect, 
  onDelete, 
  canSelect,
  isEditingName,
  newName,
  onNameEdit,
  onNameSave,
  onNameCancel,
  onNameChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const yearsToRetirement = result.inputs.retirement_age - result.inputs.age;
  
  const allMetrics = [
    { key: 'goal_probability', label: 'Success Probability', value: formatPercentage(result.results.summary.goal_probability), tooltip: 'Probability of meeting your retirement goal' },
    { key: 'median', label: 'Median Wealth', value: formatCurrency(result.results.summary.median), tooltip: 'Expected portfolio value at retirement' },
    { key: 'percentile_10', label: '10th Percentile', value: formatCurrency(result.results.summary.percentile_10), tooltip: 'Worst-case scenario (bottom 10%)' },
    { key: 'percentile_90', label: '90th Percentile', value: formatCurrency(result.results.summary.percentile_90), tooltip: 'Best-case scenario (top 10%)' },
    { key: 'volatility', label: 'Volatility', value: formatPercentage(result.results.summary.volatility), tooltip: 'Annual portfolio standard deviation' },
    { key: 'max_drawdown', label: 'Max Drawdown', value: `-${formatPercentage(result.results.summary.max_drawdown)}`, tooltip: 'Largest peak-to-trough decline' },
    { key: 'var_5', label: 'Value at Risk (95%)', value: formatCurrency(result.results.summary.var_5), tooltip: 'Maximum loss in worst 5% of scenarios' },
    { key: 'cvar_5', label: 'Conditional VaR', value: formatCurrency(result.results.summary.cvar_5), tooltip: 'Average loss in worst 5% of scenarios' },
  ];
  
  return (
    <Card className="premium-card hover:shadow-large transition-all duration-300 hover:scale-[1.02] relative group border-border/50">
      <div className="absolute top-6 right-6 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={!canSelect}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
      
      <CardHeader className="pb-4 pr-16">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-lg font-semibold"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={onNameSave} className="bg-gradient-primary font-medium">Save</Button>
                  <Button size="sm" variant="outline" onClick={onNameCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <CardTitle 
                className="text-xl text-foreground cursor-pointer hover:text-primary transition-colors font-semibold"
                onClick={() => onNameEdit(result.name)}
              >
                {result.name}
              </CardTitle>
            )}
            <CardDescription className="flex items-center gap-2 text-muted-foreground font-medium mt-2">
              <Calendar className="h-4 w-4" />
              {result.timestamp.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Investment Timeline</span>
            <div className="font-semibold text-foreground text-lg">{result.inputs.age} → {result.inputs.retirement_age}</div>
            <div className="text-muted-foreground text-sm">{yearsToRetirement} years</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Retirement Goal</span>
            <div className="font-semibold text-foreground text-lg">{formatCurrency(result.inputs.goal)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Current Savings</span>
            <div className="font-semibold text-foreground text-lg">{formatCurrency(result.inputs.savings)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Annual Contribution</span>
            <div className="font-semibold text-foreground text-lg">{formatCurrency(result.inputs.contribution)}</div>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Success Probability</span>
            <Badge 
              variant={result.results.summary.goal_probability >= 0.75 ? "default" : "secondary"}
              className={result.results.summary.goal_probability >= 0.75 
                ? "bg-gradient-success text-white font-semibold" 
                : "bg-warning text-warning-foreground font-semibold"
              }
            >
              {formatPercentage(result.results.summary.goal_probability)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Expected Wealth</span>
            <span className="font-semibold text-foreground text-lg">
              {formatCurrency(result.results.summary.median)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Max Drawdown Risk</span>
            <span className="font-semibold text-warning">
              -{formatPercentage(result.results.summary.max_drawdown)}
            </span>
          </div>
        </div>

        {/* Collapsible Full Stats Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium">
              <span>View Detailed Analytics</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4 border-t border-border">
            {allMetrics.map((metric) => (
              <div key={metric.key} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium">{metric.label}</span>
                  <InfoTooltip content={metric.tooltip} />
                </div>
                <span className="font-semibold text-foreground">
                  {metric.value}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SavedResultCard;