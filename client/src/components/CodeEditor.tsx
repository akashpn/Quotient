import React, { useEffect, useRef, useState } from 'react';
import { editor as monacoEditor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { 
  ChevronDown, 
  Indent, 
  MessageSquareQuote, 
  Search, 
  Play, 
  Save 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { SiJavascript, SiHtml5, SiCss3, SiTypescript, SiPython, SiJava, SiPhp, SiMarkdown, SiJson } from 'react-icons/si';
import { supportedLanguages } from '@shared/schema';

// Load Monaco editor globally
if (typeof window !== 'undefined') {
  import('monaco-editor').then(monaco => {
    // Setup Monaco with custom theme
    monaco.editor.defineTheme('quotientDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#E1E1E1',
        'editorCursor.foreground': '#6366F1',
        'editor.lineHighlightBackground': '#2D2D2D',
        'editorLineNumber.foreground': '#A0A0A0',
        'editor.selectionBackground': '#3E4451',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });
  });
}

interface CodeEditorProps {
  onRunCode?: () => void;
}

const getLanguageIcon = (language: string) => {
  switch (language.toLowerCase()) {
    case 'javascript': return <SiJavascript className="text-yellow-400" />;
    case 'typescript': return <SiTypescript className="text-blue-500" />;
    case 'html': return <SiHtml5 className="text-orange-500" />;
    case 'css': return <SiCss3 className="text-blue-400" />;
    case 'python': return <SiPython className="text-blue-500" />;
    case 'java': return <SiJava className="text-orange-600" />;
    case 'php': return <SiPhp className="text-indigo-400" />;
    case 'markdown': return <SiMarkdown className="text-gray-400" />;
    case 'json': return <SiJson className="text-yellow-200" />;
    default: return null;
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({ onRunCode }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const { activeFile, updateFileContent, setLanguage } = useEditorContext();
  const { sendEdit, sendCursor, sendSelection, collaborators } = useCollaborationContext();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Setup editor when component mounts or active file changes
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    // Clean up any existing editor instance
    if (editorInstance) {
      editorInstance.dispose();
    }

    const editor = monaco.editor.create(editorRef.current, {
      value: activeFile.content,
      language: activeFile.language,
      theme: 'quotientDark',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      scrollBeyondLastLine: false,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      lineNumbers: 'on',
      lineHeight: 22,
      renderLineHighlight: 'all',
      cursorBlinking: 'phase',
      cursorSmoothCaretAnimation: 'on',
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
      wordWrap: 'on',
    });

    // Handle content changes
    const changeDisposable = editor.onDidChangeModelContent((event) => {
      if (event.changes.length > 0) {
        const newContent = editor.getValue();
        updateFileContent(activeFile.id, newContent);
        sendEdit(activeFile.id, newContent);
      }
    });

    // Handle cursor position changes
    const cursorDisposable = editor.onDidChangeCursorPosition((event) => {
      const position = event.position;
      sendCursor(activeFile.id, {
        lineNumber: position.lineNumber,
        column: position.column
      });
    });

    // Handle selection changes
    const selectionDisposable = editor.onDidChangeCursorSelection((event) => {
      const selection = event.selection;
      sendSelection(activeFile.id, {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      });
    });

    setEditorInstance(editor);

    return () => {
      changeDisposable.dispose();
      cursorDisposable.dispose();
      selectionDisposable.dispose();
      editor.dispose();
    };
  }, [activeFile?.id]);

  // Update editor content when collaborator makes changes
  useEffect(() => {
    if (!editorInstance || !activeFile) return;
    
    // Only update if content actually differs to avoid cursor jumps
    const currentContent = editorInstance.getValue();
    if (currentContent !== activeFile.content) {
      const position = editorInstance.getPosition();
      editorInstance.setValue(activeFile.content);
      if (position) {
        editorInstance.setPosition(position);
      }
    }
  }, [activeFile?.content]);
  
  // Render collaborator cursors and selections
  useEffect(() => {
    if (!editorInstance || !activeFile) return;

    // Clear existing decorations
    editorInstance.deltaDecorations([], []);

    // Add collaborator cursors and selections
    const decorations = collaborators
      .filter(c => c.fileId === activeFile.id)
      .flatMap(collab => {
        const decorationsArray = [];
        
        // Add cursor
        if (collab.cursor) {
          decorationsArray.push({
            range: new monaco.Range(
              collab.cursor.lineNumber,
              collab.cursor.column,
              collab.cursor.lineNumber,
              collab.cursor.column + 1
            ),
            options: {
              className: `user-cursor-${collab.userId}`,
              hoverMessage: { value: collab.username },
              beforeContentClassName: `cursor-block-${collab.userId}`,
            }
          });
        }
        
        // Add selection
        if (collab.selection && 
            (collab.selection.startLineNumber !== collab.selection.endLineNumber || 
             collab.selection.startColumn !== collab.selection.endColumn)) {
          decorationsArray.push({
            range: new monaco.Range(
              collab.selection.startLineNumber,
              collab.selection.startColumn,
              collab.selection.endLineNumber,
              collab.selection.endColumn
            ),
            options: {
              className: `user-selection-${collab.userId}`,
            }
          });
        }
        
        return decorationsArray;
      });

    if (decorations.length > 0) {
      editorInstance.deltaDecorations([], decorations);
    }
    
    // Add dynamic styles for collaborator cursors
    collaborators.forEach(collab => {
      const style = document.createElement('style');
      const color = getUserColor(collab.userId);
      
      style.innerHTML = `
        .user-cursor-${collab.userId} {
          background-color: ${color};
          width: 2px !important;
          animation: blink 1s infinite;
        }
        .cursor-block-${collab.userId} {
          background-color: ${color};
          width: 2px !important;
          height: 18px !important;
          position: absolute;
        }
        .user-selection-${collab.userId} {
          background-color: ${color}33;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
      
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    });
  }, [collaborators, activeFile?.id]);
  
  // Function to generate a deterministic color for a user
  const getUserColor = (userId: number): string => {
    const colors = [
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#6366F1', // indigo
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
    ];
    
    return colors[userId % colors.length];
  };
  
  const handleSaveFile = () => {
    if (activeFile) {
      // Send save message to backend
      sendEdit(activeFile.id, activeFile.content, true);
    }
  };
  
  const handleLanguageChange = (language: string) => {
    if (activeFile) {
      setLanguage(activeFile.id, language);
      setShowLanguageSelector(false);
      
      // Update Monaco editor language
      if (editorInstance) {
        monaco.editor.setModelLanguage(editorInstance.getModel()!, language);
      }
    }
  };
  
  // Format the code
  const formatCode = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.action.formatDocument')?.run();
    }
  };
  
  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary">
        <p className="text-muted-foreground">No file open</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-secondary">
      {/* Editor Toolbar */}
      <div className="border-b border-gray-800 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded h-auto"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <span className="mr-2">{getLanguageIcon(activeFile.language)}</span>
              <span className="capitalize">{activeFile.language}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {showLanguageSelector && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-tertiary rounded-md shadow-lg z-50 p-2">
                <div className="grid grid-cols-1 gap-1">
                  {supportedLanguages.map((lang) => (
                    <Button
                      key={lang}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <span className="mr-2">{getLanguageIcon(lang)}</span>
                      <span className="capitalize">{lang}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-1 text-muted-foreground hover:text-foreground rounded h-7 w-7"
              title="Format Code"
              onClick={formatCode}
            >
              <Indent className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-1 text-muted-foreground hover:text-foreground rounded h-7 w-7"
              title="Comment"
            >
              <MessageSquareQuote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-1 text-muted-foreground hover:text-foreground rounded h-7 w-7"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 text-sm text-muted-foreground hover:text-foreground rounded h-7 w-7"
            title="Run Code"
            onClick={onRunCode}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 text-sm text-muted-foreground hover:text-foreground rounded h-7 w-7"
            title="Save"
            onClick={handleSaveFile}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Monaco Editor Container */}
      <div className="editor-container flex-1 relative">
        <div ref={editorRef} className="absolute top-0 left-0 right-0 bottom-0" />
      </div>
    </div>
  );
};

export default CodeEditor;
