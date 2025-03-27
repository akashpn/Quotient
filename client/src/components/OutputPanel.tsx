import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Trash2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('output');
  
  if (!visible) return null;
  
  return (
    <div className="h-64 md:h-auto md:w-1/3 bg-primary border-t md:border-t-0 md:border-l border-gray-800 flex flex-col">
      <div className="border-b border-gray-800 px-4 py-2 flex justify-between items-center">
        <Tabs defaultValue="output" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-0 p-0 h-auto">
            <TabsTrigger 
              value="output" 
              className="px-3 py-1 text-xs font-medium data-[state=active]:bg-tertiary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md h-auto"
            >
              Output
            </TabsTrigger>
            <TabsTrigger 
              value="console" 
              className="px-3 py-1 text-xs font-medium data-[state=active]:bg-tertiary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md h-auto"
            >
              Console
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="px-3 py-1 text-xs font-medium data-[state=active]:bg-tertiary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md h-auto"
            >
              Problems
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="p-1 text-muted-foreground hover:text-foreground h-5 w-5"
            onClick={onClear}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-1 text-muted-foreground hover:text-foreground h-5 w-5"
            onClick={onToggleVisibility}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {activeTab === 'output' && (
          <>
            {output.executionTime !== undefined && (
              <div className="text-green-400 mb-2">✓ Code executed successfully ({output.executionTime}ms)</div>
            )}
            <div className="whitespace-pre-wrap">{output.result}</div>
            
            {output.result && output.result.startsWith('{') && (
              <div className="p-2 bg-tertiary rounded-md mt-3">
                <pre className="text-xs text-foreground">{
                  // Try to pretty print JSON
                  (() => {
                    try {
                      return JSON.stringify(JSON.parse(output.result), null, 2);
                    } catch {
                      return output.result;
                    }
                  })()
                }</pre>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'console' && (
          <div className="space-y-1">
            {(output.logs || []).map((log, index) => (
              <div key={index} className="text-muted-foreground">
                <span className="text-gray-500">[log]:</span> {log}
              </div>
            ))}
            {output.logs?.length === 0 && (
              <div className="text-muted-foreground italic">No console output</div>
            )}
          </div>
        )}
        
        {activeTab === 'problems' && (
          <div className="space-y-1">
            {(output.errors || []).map((error, index) => (
              <div key={index} className="text-red-400">
                {error}
              </div>
            ))}
            {output.errors?.length === 0 && (
              <div className="text-green-400">No problems found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
