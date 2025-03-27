import { useContext } from "react";
import { EditorContext } from "../contexts/EditorContext";
import { getFileIcon } from "../lib/file-icons";

export default function EditorTabs() {
  const { openFiles, currentFile, setCurrentFile, closeFile } = useContext(EditorContext);
  
  return (
    <div className="flex items-center bg-dark-lighter overflow-x-auto scrollbar-thin whitespace-nowrap">
      {openFiles.map((file) => (
        <div 
          key={file.id}
          className={`flex items-center px-3 py-2 border-r border-dark-border cursor-pointer ${currentFile?.id === file.id ? 'bg-dark-surface' : ''}`}
          onClick={() => setCurrentFile(file)}
        >
          {getFileIcon(file.language)}
          <span className="text-sm">{file.name}</span>
          <button 
            className="ml-2 p-0.5 rounded-sm hover:bg-dark-border"
            onClick={(e) => {
              e.stopPropagation();
              closeFile(file.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
