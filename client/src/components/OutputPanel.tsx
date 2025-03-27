import React from 'react';
import { X, Clock, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OutputPanelProps {
  visible: boolean;
  onToggleVisibility: () => void;
  output: {
    result: string;
    executionTime?: number;
    logs?: string[];
    errors?: string[];
  };
  onClear: () => void;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  visible,
  onToggleVisibility,
  output,
  onClear
}) => {
  if (!visible) return null;

  // Safely check if there are errors or logs
  const errors = output.errors || [];
  const logs = output.logs || [];
  const hasErrors = errors.length > 0;
  const hasLogs = logs.length > 0;
  
  return (
    <div className="bg-secondary border-t border-gray-800 h-64 flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Output</span>
          {output.executionTime !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground ml-4">
              <Clock className="h-3 w-3 mr-1" />
              <span>{output.executionTime}ms</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleVisibility}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        {hasLogs && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Terminal className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-xs uppercase font-medium text-muted-foreground">Console Output</span>
            </div>
            <div className="bg-tertiary rounded p-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="py-0.5">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasErrors && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
              <span className="text-xs uppercase font-medium text-muted-foreground">Errors</span>
            </div>
            <div className="bg-tertiary rounded p-2 font-mono text-sm text-red-400">
              {errors.map((error, index) => (
                <div key={index} className="py-0.5">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!hasLogs && !hasErrors && output.result && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
              <span className="text-xs uppercase font-medium text-muted-foreground">Result</span>
            </div>
            <div className="bg-tertiary rounded p-2 font-mono text-sm">
              {output.result}
            </div>
          </div>
        )}
        
        {!hasLogs && !hasErrors && !output.result && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span>No output to display</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default OutputPanel;