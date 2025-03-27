import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FilePlus, 
  FolderPlus, 
  ChevronLeft,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useEditorContext } from '@/contexts/EditorContext';
import { SiJavascript, SiHtml5, SiCss3, SiTypescript, SiPython, SiJava, SiPhp, SiMarkdown, SiJson } from 'react-icons/si';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const getLanguageIcon = (extension: string) => {
  switch (extension.toLowerCase()) {
    case 'js': return <SiJavascript className="text-yellow-400" />;
    case 'ts': return <SiTypescript className="text-blue-500" />;
    case 'html': return <SiHtml5 className="text-orange-500" />;
    case 'css': return <SiCss3 className="text-blue-400" />;
    case 'py': return <SiPython className="text-blue-500" />;
    case 'java': return <SiJava className="text-orange-600" />;
    case 'php': return <SiPhp className="text-indigo-400" />;
    case 'md': return <SiMarkdown className="text-gray-400" />;
    case 'json': return <SiJson className="text-yellow-200" />;
    default: return <File className="text-neutral" />;
  }
};

const getExtension = (filename: string) => {
  return filename.split('.').pop() || '';
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { activeProject, projectFiles, createFile, createFolder } = useProjectContext();
  const { openFile } = useEditorContext();
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
  });

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const handleFileClick = (fileId: number) => {
    openFile(fileId);
  };

  const handleNewFile = () => {
    const filename = prompt("Enter file name:");
    if (filename && activeProject) {
      createFile({
        name: filename,
        path: '/',
        content: '',
        language: getExtension(filename) === 'js' ? 'javascript' : 'text',
        projectId: activeProject.id
      });
    }
  };

  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && activeProject) {
      createFolder(folderName, activeProject.id);
    }
  };

  if (collapsed) {
    return (
      <aside className="bg-secondary border-r border-gray-800 w-10 flex flex-col transition-all duration-300 ease-in-out">
        <Button 
          variant="ghost" 
          className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
          onClick={onToggle}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="bg-secondary w-64 flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="font-medium text-sm">PROJECT FILES</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleNewFile}
                >
                  <FilePlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New File</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleNewFolder}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Folder</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={onToggle}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse Sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        {activeProject && (
          <>
            <div className="mb-2">
              <div 
                className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => toggleFolder('src')}
              >
                {expandedFolders['src'] ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-2 text-amber-400" />
                <span className="text-sm">src</span>
              </div>
              
              {expandedFolders['src'] && (
                <div className="ml-4">
                  {projectFiles
                    .filter(file => file.path.startsWith('/src'))
                    .map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleFileClick(file.id)}
                      >
                        <span className="mr-2">{getLanguageIcon(getExtension(file.name))}</span>
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <div 
                className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => toggleFolder('tests')}
              >
                {expandedFolders['tests'] ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-2 text-amber-400" />
                <span className="text-sm">tests</span>
              </div>
              {expandedFolders['tests'] && (
                <div className="ml-4">
                  {projectFiles
                    .filter(file => file.path.startsWith('/tests'))
                    .map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleFileClick(file.id)}
                      >
                        <span className="mr-2">{getLanguageIcon(getExtension(file.name))}</span>
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <div 
                className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => toggleFolder('assets')}
              >
                {expandedFolders['assets'] ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-2 text-amber-400" />
                <span className="text-sm">assets</span>
              </div>
              {expandedFolders['assets'] && (
                <div className="ml-4">
                  {projectFiles
                    .filter(file => file.path.startsWith('/assets'))
                    .map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleFileClick(file.id)}
                      >
                        <span className="mr-2">{getLanguageIcon(getExtension(file.name))}</span>
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {projectFiles
              .filter(file => file.path === '/')
              .map((file) => (
                <div 
                  key={file.id}
                  className="flex items-center py-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleFileClick(file.id)}
                >
                  <span className="mr-2">{getLanguageIcon(getExtension(file.name))}</span>
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
