import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProjectContext } from './ProjectContext';
import { File } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface CursorPosition {
  lineNumber: number;
  column: number;
}

interface EditorContextProps {
  openFiles: File[];
  activeFileId: number | null;
  activeFile: File | null;
  cursorPosition: CursorPosition | null;
  openFile: (fileId: number) => void;
  closeFile: (fileId: number) => void;
  updateFileContent: (fileId: number, content: string) => void;
  setActiveFile: (fileId: number) => void;
  setLanguage: (fileId: number, language: string) => void;
  setCursorPosition: (position: CursorPosition) => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projectFiles } = useProjectContext();
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  
  // Compute the active file from activeFileId
  const activeFile = openFiles.find(file => file.id === activeFileId) || null;
  
  // Open a file
  const openFile = (fileId: number) => {
    const file = projectFiles.find(f => f.id === fileId);
    if (!file) return;
    
    // Check if file is already open
    if (!openFiles.some(f => f.id === fileId)) {
      setOpenFiles(prev => [...prev, file]);
    }
    
    setActiveFileId(fileId);
  };
  
  // Close a file
  const closeFile = (fileId: number) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    
    // If the active file was closed, set a new active file
    if (activeFileId === fileId) {
      setActiveFileId(openFiles.filter(f => f.id !== fileId)[0]?.id || null);
    }
  };
  
  // Update file content
  const updateFileContent = (fileId: number, content: string) => {
    setOpenFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, content } 
          : file
      )
    );
  };
  
  // Set file language
  const setLanguage = async (fileId: number, language: string) => {
    try {
      // Update file in backend
      await apiRequest('PUT', `/api/files/${fileId}`, { language });
      
      // Update local state
      setOpenFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, language } 
            : file
        )
      );
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };
  
  // When project files change, update any open files
  useEffect(() => {
    setOpenFiles(prev => 
      prev.map(openFile => {
        const updatedFile = projectFiles.find(f => f.id === openFile.id);
        return updatedFile || openFile;
      })
    );
  }, [projectFiles]);
  
  return (
    <EditorContext.Provider
      value={{
        openFiles,
        activeFileId,
        activeFile,
        cursorPosition,
        openFile,
        closeFile,
        updateFileContent,
        setActiveFile: setActiveFileId,
        setLanguage,
        setCursorPosition,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
