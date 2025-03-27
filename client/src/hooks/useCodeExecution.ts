import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { SupportedLanguage } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ExecutionResult {
  result: string;
  error: string | null;
  executionTime: number;
  logs?: string[];
}

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const { toast } = useToast();

  const executeCode = async (code: string, language: SupportedLanguage) => {
    setIsExecuting(true);
    setLastResult(null);
    
    try {
      console.log(`Executing ${language} code...`);
      const response = await apiRequest('POST', '/api/execute', { 
        code, 
        language 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute code');
      }
      
      const result = await response.json();
      
      // Parse logs if they exist in the output
      let parsedLogs: string[] = [];
      if (result.result) {
        try {
          // Check if it's in JSON format 
          // (our JavaScript executor returns logs as a JSON string)
          const lastLine = result.result.trim().split('\\n').pop();
          parsedLogs = JSON.parse(lastLine);
        } catch (e) {
          // Not JSON, just split by lines
          parsedLogs = result.result.split('\\n');
        }
      }
      
      const executionResult: ExecutionResult = {
        result: result.result || '',
        error: result.error,
        executionTime: result.executionTime,
        logs: parsedLogs
      };
      
      setLastResult(executionResult);
      
      if (result.error) {
        toast({
          title: 'Execution Error',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Code Executed Successfully',
          description: `Executed in ${result.executionTime}ms`,
        });
      }
      
      return executionResult;
    } catch (error) {
      console.error('Code execution error:', error);
      
      const errorMessage = (error as Error).message;
      const executionResult: ExecutionResult = {
        result: '',
        error: errorMessage,
        executionTime: 0,
        logs: []
      };
      
      setLastResult(executionResult);
      
      toast({
        title: 'Execution Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return executionResult;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeCode,
    isExecuting,
    lastResult
  };
}