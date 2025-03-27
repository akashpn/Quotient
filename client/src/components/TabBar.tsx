import React from 'react';
import { X, Columns, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/contexts/EditorContext';
import { SiJavascript, SiHtml5, SiCss3, SiTypescript, SiPython, SiJava, SiPhp, SiMarkdown, SiJson } from 'react-icons/si';

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

interface TabBarProps {
  onSplitEditor?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ onSplitEditor }) => {
  const { openFiles, activeFileId, closeFile, setActiveFile } = useEditorContext();

  return (
    <div className="bg-secondary border-b border-gray-800 flex items-center">
      <div className="flex-1 flex overflow-x-auto hide-scrollbar">
        <div className="flex">
          {openFiles.map((file) => (
            <div 
              key={file.id}
              className={`border-r border-gray-800 ${file.id === activeFileId ? 'bg-tertiary' : ''} px-4 py-2 flex items-center cursor-pointer`}
              onClick={() => setActiveFile(file.id)}
            >
              <span className="mr-2">
                {getLanguageIcon(file.language)}
              </span>
              <span className={`text-sm whitespace-nowrap ${file.id === activeFileId ? 'text-foreground' : 'text-muted-foreground'}`}>
                {file.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md"
          onClick={onSplitEditor}
          title="Split Editor"
        >
          <Columns className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md"
          title="More Actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TabBar;
