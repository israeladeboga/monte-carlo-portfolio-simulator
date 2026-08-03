
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSimulationHistory } from '@/contexts/SimulationHistoryContext';

interface SaveSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export const SaveSimulationModal: React.FC<SaveSimulationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName,
}) => {
  const { getNextAutoName } = useSimulationHistory();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(defaultName || getNextAutoName());
    }
  }, [isOpen, getNextAutoName, defaultName]);

  const handleSave = () => {
    const finalName = name.trim() || getNextAutoName();
    onSave(finalName);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Save Simulation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter a name for this simulation to save it to your results.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-slate-300">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="col-span-3 bg-slate-800 border-slate-600 text-white"
              placeholder="Enter simulation name"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
