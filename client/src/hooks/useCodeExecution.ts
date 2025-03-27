import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

type ExecutionResult = {
  output: string;
  error: string | null;
  executionTime: number;
};

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  const executeCode = useCallback(async (code: string, language: string): Promise<ExecutionResult> => {
    setIsExecuting(true);
    
    try {
      const startTime = performance.now();
      
      const response = await apiRequest("POST", "/api/execute", { 
        code, 
        language: language.toLowerCase() 
      });
      
      const result = await response.json();
      const executionTime = performance.now() - startTime;
      
      const executionResult = {
        output: result.output || "",
        error: result.error || null,
        executionTime
      };
      
      setLastResult(executionResult);
      return executionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const failedResult = {
        output: "",
        error: errorMessage,
        executionTime: 0
      };
      
      setLastResult(failedResult);
      return failedResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return {
    executeCode,
    isExecuting,
    lastResult
  };
}
