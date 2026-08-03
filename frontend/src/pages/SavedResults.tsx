
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, AlertTriangle } from 'lucide-react';
import { useSimulationHistory } from '@/contexts/SimulationHistoryContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResultsComparison } from '@/components/ResultsComparison';
import { generatePDF } from '@/lib/pdfGenerator';
import SavedResultCard from '@/components/SavedResultCard';

const SavedResults = () => {
  const { savedResults, deleteSavedResult, updateResultName } = useSimulationHistory();
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleResultSelection = (resultId: string, checked: boolean) => {
    if (checked) {
      if (selectedResults.length < 3) {
        setSelectedResults([...selectedResults, resultId]);
      }
    } else {
      setSelectedResults(selectedResults.filter(id => id !== resultId));
    }
  };

  const handleCompare = () => {
    setShowComparison(true);
  };

  const handleSharePDF = async () => {
    if (selectedResults.length === 1) {
      const result = savedResults.find(r => r.id === selectedResults[0]);
      if (result) {
        await generatePDF(result);
      }
    }
  };

  const handleNameEdit = (resultId: string, currentName: string) => {
    setEditingName(resultId);
    setNewName(currentName);
  };

  const handleNameSave = (resultId: string) => {
    updateResultName(resultId, newName);
    setEditingName(null);
    setNewName('');
  };

  const selectedResultsData = savedResults.filter(result => 
    selectedResults.includes(result.id)
  );

  if (showComparison && selectedResultsData.length >= 2) {
    return (
      <ResultsComparison 
        results={selectedResultsData} 
        onClose={() => setShowComparison(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Saved Results
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Compare and manage your retirement simulation scenarios with professional-grade analysis tools
          </p>
        </div>

        {savedResults.length === 0 ? (
          <div className="max-w-md mx-auto">
            <Alert className="premium-card border-warning/20 bg-warning-light">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <AlertDescription className="text-foreground font-medium text-base">
                No saved results yet. Run simulations and save them to compare different scenarios and build your retirement strategy.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {savedResults.map((result) => (
              <SavedResultCard
                key={result.id}
                result={result}
                isSelected={selectedResults.includes(result.id)}
                onSelect={(checked) => handleResultSelection(result.id, checked)}
                onDelete={() => deleteSavedResult(result.id)}
                canSelect={selectedResults.length < 3 || selectedResults.includes(result.id)}
                isEditingName={editingName === result.id}
                newName={newName}
                onNameEdit={(name) => handleNameEdit(result.id, name)}
                onNameSave={() => handleNameSave(result.id)}
                onNameCancel={() => setEditingName(null)}
                onNameChange={setNewName}
              />
            ))}
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <Button
            onClick={handleCompare}
            disabled={selectedResults.length < 2 || selectedResults.length > 3}
            className={`${
              selectedResults.length >= 2 && selectedResults.length <= 3
                ? 'bg-gradient-primary shadow-glass hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            } px-4 py-3 rounded-full shadow-large transition-all duration-200 font-semibold flex items-center gap-2`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Compare</span>
          </Button>
          
          <Button
            onClick={handleSharePDF}
            disabled={selectedResults.length !== 1}
            className={`${
              selectedResults.length === 1
                ? 'bg-gradient-success shadow-glass hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            } px-4 py-3 rounded-full shadow-large transition-all duration-200 font-semibold flex items-center gap-2`}
          >
            <FileText className="h-5 w-5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedResults;
