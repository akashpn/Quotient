import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import TabBar from '@/components/TabBar';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';
import StatusBar from '@/components/StatusBar';
import CollaborationToast from '@/components/CollaborationToast';
import LanguageModal from '@/components/LanguageModal';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { canExecuteLanguage } from '@/utils/languageUtils';

const Editor: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [outputVisible, setOutputVisible] = useState(true);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const { activeFile } = useEditorContext();
  const { collaborators } = useCollaborationContext();
  
  const [outputContent, setOutputContent] = useState({
    result: '',
    executionTime: undefined as number | undefined,
    logs: [] as string[],
    errors: [] as string[]
  });
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const toggleOutputPanel = () => {
    setOutputVisible(!outputVisible);
  };
  
  const handleRunCode = () => {
    if (!activeFile) return;
    
    // Clear previous output
    setOutputContent({
      result: '',
      executionTime: undefined,
      logs: [],
      errors: []
    });
    
    // Only try to execute if language is supported
    if (!canExecuteLanguage(activeFile.language as any)) {
      setOutputContent({
        result: `Execution not supported for ${activeFile.language} files.`,
        executionTime: 0,
        logs: [],
        errors: []
      });
      return;
    }
    
    const startTime = performance.now();
    
    // Capture console.log output
    const originalConsoleLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.map(arg => String(arg)).join(' '));
      originalConsoleLog(...args);
    };
    
    try {
      // Very simple execution for demo purposes
      // In a real app, this would use a sandboxed environment or server-side execution
      if (activeFile.language === 'javascript' || activeFile.language === 'typescript') {
        // eslint-disable-next-line no-new-func
        const result = new Function(activeFile.content)();
        const executionTime = Math.round(performance.now() - startTime);
        
        setOutputContent({
          result: result !== undefined ? String(result) : 'Code executed successfully.',
          executionTime,
          logs,
          errors: []
        });
      } else {
        setOutputContent({
          result: 'Server-side execution not implemented in this demo.',
          executionTime: 0,
          logs,
          errors: []
        });
      }
    } catch (error) {
      const executionTime = Math.round(performance.now() - startTime);
      setOutputContent({
        result: 'Execution failed.',
        executionTime,
        logs,
        errors: [(error as Error).toString()]
      });
    } finally {
      // Restore console.log
      console.log = originalConsoleLog;
    }
  };
  
  const clearOutput = () => {
    setOutputContent({
      result: '',
      executionTime: undefined,
      logs: [],
      errors: []
    });
  };
  
  return (
    <div className="h-screen flex flex-col bg-primary overflow-hidden">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <TabBar onSplitEditor={() => {}} />
          
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <CodeEditor onRunCode={handleRunCode} />
            
            {/* Resizer div - in a real app would need JS to handle resize interaction */}
            <div className="cursor-col-resize w-1 bg-gray-800 hover:bg-accent transition-colors duration-150"></div>
            
            <OutputPanel 
              visible={outputVisible} 
              onToggleVisibility={toggleOutputPanel}
              output={outputContent}
              onClear={clearOutput}
            />
          </div>
          
          <StatusBar />
        </main>
      </div>
      
      <CollaborationToast />
      
      <LanguageModal 
        open={languageModalOpen}
        onOpenChange={setLanguageModalOpen}
      />
      
      {/* Add Monaco editor styles for collaborative cursors and selections */}
      <style jsx global>{`
        .user-cursor {
          position: absolute;
          width: 2px;
          height: 18px;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .user-highlight {
          opacity: 0.2;
          position: absolute;
        }
        
        .monaco-editor .monaco-editor-background,
        .monaco-editor .margin-view-overlays {
          background-color: #1E1E1E;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (max-width: 768px) {
          .sidebar-collapsed {
            width: 0;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default Editor;
