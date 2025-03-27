import { useState, useCallback, useEffect } from "react";
import * as monaco from "monaco-editor";
import { supportedLanguages } from "../lib/languages";

// Type for cursor position
export type CursorPosition = {
  lineNumber: number;
  column: number;
};

// Type for editor file
export type EditorFile = {
  id: string;
  name: string;
  language: string;
  content: string;
};

// Type for output line
export type OutputLine = {
  content: string;
  type: "info" | "error" | "success";
};

// Sample files
const sampleFiles: EditorFile[] = [
  {
    id: "file1",
    name: "main.js",
    language: "JavaScript",
    content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to the Quotient API',
    status: 'success'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`,
  },
  {
    id: "file2",
    name: "index.html",
    language: "HTML",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotient App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to Quotient</h1>
    <p>A collaborative code editor</p>
  </div>
  <script src="main.js"></script>
</body>
</html>`,
  },
  {
    id: "file3",
    name: "styles.css",
    language: "CSS",
    content: `body {
  font-family: 'Inter', sans-serif;
  background-color: #121212;
  color: white;
  margin: 0;
  padding: 20px;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #1E1E1E;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #6366F1;
}`,
  },
];

// Custom hook for Monaco editor theme
export function useMonacoTheme() {
  const setupMonacoTheme = useCallback(() => {
    monaco.editor.defineTheme("quotientDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "operator", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#121212",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2D2D2D",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorIndentGuide.background": "#404040",
      },
    });
  }, []);

  return { setupMonacoTheme };
}

// Custom hook for editor functionality
export function useEditor() {
  const [files, setFiles] = useState<EditorFile[]>(sampleFiles);
  const [openFiles, setOpenFiles] = useState<EditorFile[]>([sampleFiles[0]]);
  const [currentFile, setCurrentFile] = useState<EditorFile | null>(sampleFiles[0]);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ lineNumber: 1, column: 1 });
  const [output, setOutput] = useState<OutputLine[]>([]);

  // Set current file
  const handleSetCurrentFile = useCallback((file: EditorFile) => {
    setCurrentFile(file);
    
    // Open the file if it's not already open
    if (!openFiles.some(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
  }, [openFiles]);

  // Close file
  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prev => {
      const newOpenFiles = prev.filter(f => f.id !== fileId);
      
      // If we're closing the current file, switch to the first available open file
      if (currentFile?.id === fileId && newOpenFiles.length > 0) {
        setCurrentFile(newOpenFiles[0]);
      } else if (newOpenFiles.length === 0) {
        setCurrentFile(null);
      }
      
      return newOpenFiles;
    });
  }, [currentFile]);

  // Update code
  const setCode = useCallback((fileId: string, newContent: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, content: newContent } 
          : file
      )
    );
    
    // Also update in open files and current file
    setOpenFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, content: newContent } 
          : file
      )
    );
    
    if (currentFile?.id === fileId) {
      setCurrentFile(prev => 
        prev 
          ? { ...prev, content: newContent } 
          : prev
      );
    }
  }, [currentFile]);

  // Set language
  const setLanguage = useCallback((fileId: string, language: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, language } 
          : file
      )
    );
    
    // Also update in open files and current file
    setOpenFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, language } 
          : file
      )
    );
    
    if (currentFile?.id === fileId) {
      setCurrentFile(prev => 
        prev 
          ? { ...prev, language } 
          : prev
      );
    }
  }, [currentFile]);

  // Run code
  const runCode = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    // Clear previous output
    setOutput([]);
    
    // Add file execution header
    setOutput(prev => [
      ...prev,
      { content: `$ node ${file.name}`, type: "info" }
    ]);
    
    // Simulate code execution based on language
    setTimeout(() => {
      if (file.language === "JavaScript") {
        // Simulate JavaScript execution
        setOutput(prev => [
          ...prev,
          { content: "Server running on port 3000", type: "success" },
          { content: "", type: "info" },
          { content: "GET / 200 4ms", type: "info" },
          { content: "{", type: "info" },
          { content: '  "message": "Welcome to the Quotient API",', type: "info" },
          { content: '  "status": "success"', type: "info" },
          { content: "}", type: "info" }
        ]);
      } else if (file.language === "Python") {
        // Simulate Python execution
        setOutput(prev => [
          ...prev,
          { content: "Hello from Python!", type: "success" }
        ]);
      } else {
        // Generic response for other languages
        setOutput(prev => [
          ...prev,
          { content: `Executing ${file.language} code...`, type: "info" },
          { content: "Execution complete!", type: "success" }
        ]);
      }
    }, 500);
  }, [files]);

  // Clear output
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    files,
    openFiles,
    currentFile,
    cursorPosition,
    output,
    setCurrentFile: handleSetCurrentFile,
    closeFile,
    setCode,
    setLanguage,
    setCursorPosition,
    runCode,
    clearOutput
  };
}
