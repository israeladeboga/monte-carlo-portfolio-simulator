
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, SortAsc, SortDesc, Calendar, Hash } from 'lucide-react';
import { useSimulationHistory } from '@/contexts/SimulationHistoryContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const SimulationHistory = () => {
  const { history, saveResult, deleteHistoryEntry, getNextAutoName } = useSimulationHistory();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSave = (historyId: string) => {
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      // Use the consistent auto-naming system
      saveResult(historyId);
      toast({
        title: "Simulation Saved",
        description: `Saved as "${getNextAutoName()}"`,
      });
    }
  };

  const handleDelete = (historyId: string) => {
    deleteHistoryEntry(historyId);
    toast({
      title: "Entry Deleted",
      description: "The simulation has been removed from history.",
    });
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection(option === 'date' ? 'desc' : 'asc');
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = a.timestamp.getTime() - b.timestamp.getTime();
    } else {
      // For name sorting, we'll use the timestamp as a proxy since entries don't have names
      comparison = a.timestamp.getTime() - b.timestamp.getTime();
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Simulation History
          </h1>
          <p className="text-slate-300 text-lg">
            View and manage your simulation history
          </p>
        </div>

        {history.length === 0 ? (
          <Alert className="border-slate-600 bg-slate-800/50">
            <Calendar className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              No simulation history yet. Run your first simulation to see it here.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Sort Controls */}
            <div className="flex gap-4 mb-6 justify-center">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={() => toggleSort('date')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Sort by Date
                {sortBy === 'date' && (
                  sortDirection === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => toggleSort('name')}
                className="flex items-center gap-2"
              >
                <Hash className="h-4 w-4" />
                Sort by ID
                {sortBy === 'name' && (
                  sortDirection === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHistory.map((entry) => (
                <Card key={entry.id} className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">
                          Simulation #{entry.id.slice(-6)}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                          {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(entry.id)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Age:</span>
                        <div className="font-medium text-white">{entry.inputs.age} → {entry.inputs.retirement_age}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Years:</span>
                        <div className="font-medium text-white">{entry.inputs.retirement_age - entry.inputs.age}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Goal:</span>
                        <div className="font-medium text-white">{formatCurrency(entry.inputs.goal)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Savings:</span>
                        <div className="font-medium text-white">{formatCurrency(entry.inputs.savings)}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Success Rate:</span>
                        <Badge 
                          variant={entry.results.summary.goal_probability >= 0.75 ? "default" : "secondary"}
                          className={entry.results.summary.goal_probability >= 0.75 ? "bg-green-600" : "bg-orange-600"}
                        >
                          {formatPercentage(entry.results.summary.goal_probability)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Median Wealth:</span>
                        <span className="font-medium text-white text-sm">
                          {formatCurrency(entry.results.summary.median)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimulationHistory;
