
import React from 'react';
import { Settings, History, Trash2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSimulationHistory } from '@/contexts/SimulationHistoryContext';
import { useNavigate } from 'react-router-dom';

const SettingsDropdown = () => {
  const { clearHistory } = useSimulationHistory();
  const navigate = useNavigate();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all simulation history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-slate-100">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/simulation-history')}>
          <History className="mr-2 h-4 w-4" />
          <span>Simulation History</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/saved-results')}>
          <Download className="mr-2 h-4 w-4" />
          <span>Saved Results</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClearHistory} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Clear History</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
