import React from 'react';
import { Circle, GitBranch, Users } from 'lucide-react';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaborationContext } from '@/contexts/CollaborationContext';

const StatusBar: React.FC = () => {
  const { activeFile, cursorPosition } = useEditorContext();
  const { isConnected, collaborators } = useCollaborationContext();
  
  const activeCollaborators = collaborators.filter(c => 
    activeFile && c.fileId === activeFile.id
  ).length;
  
  return (
    <footer className="bg-tertiary border-t border-gray-800 py-1 px-4 text-xs text-muted-foreground flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Circle className={`h-3 w-3 mr-1.5 ${isConnected ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div className="flex items-center">
          <GitBranch className="h-3 w-3 mr-1" />
          <span>main</span>
        </div>
        
        {/* Active users */}
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1.5" />
          <span>{activeCollaborators} {activeCollaborators === 1 ? 'collaborator' : 'collaborators'}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div>
          {cursorPosition ? `Ln ${cursorPosition.lineNumber}, Col ${cursorPosition.column}` : ''}
        </div>
        
        <div className="capitalize">
          {activeFile?.language || ''}
        </div>
        
        <div>
          UTF-8
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
