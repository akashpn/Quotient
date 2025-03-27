import React from 'react';
import { X, Code } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supportedLanguages } from '@shared/schema';
import { useEditorContext } from '@/contexts/EditorContext';
import { 
  SiJavascript, 
  SiTypescript, 
  SiPython, 
  SiPhp, 
  SiHtml5, 
  SiCss3, 
  SiJson, 
  SiMarkdown 
} from 'react-icons/si';

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ open, onOpenChange }) => {
  const { activeFile, setLanguage } = useEditorContext();
  
  if (!activeFile) return null;
  
  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'javascript': return <SiJavascript className="text-yellow-400 w-5 h-5" />;
      case 'typescript': return <SiTypescript className="text-blue-500 w-5 h-5" />;
      case 'python': return <SiPython className="text-blue-400 w-5 h-5" />;
      case 'java': return <Code className="text-orange-500 w-5 h-5" />;
      case 'c': return <Code className="text-blue-500 w-5 h-5" />;
      case 'cpp': return <Code className="text-blue-700 w-5 h-5" />;
      case 'csharp': return <Code className="text-green-600 w-5 h-5" />;
      case 'go': return <Code className="text-blue-400 w-5 h-5" />;
      case 'rust': return <Code className="text-orange-600 w-5 h-5" />;
      case 'ruby': return <Code className="text-red-600 w-5 h-5" />;
      case 'php': return <SiPhp className="text-indigo-400 w-5 h-5" />;
      case 'html': return <SiHtml5 className="text-orange-600 w-5 h-5" />;
      case 'css': return <SiCss3 className="text-blue-500 w-5 h-5" />;
      case 'json': return <SiJson className="text-yellow-200 w-5 h-5" />;
      case 'markdown': return <SiMarkdown className="text-gray-400 w-5 h-5" />;
      default: return <Code className="text-gray-400 w-5 h-5" />;
    }
  };
  
  const handleLanguageSelect = (language: string) => {
    setLanguage(activeFile.id, language);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-tertiary border-gray-700 max-w-md">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle>Select Language</DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {supportedLanguages.map((language) => (
            <Button
              key={language}
              variant="ghost"
              className="flex items-center justify-start p-2 hover:bg-secondary rounded-md transition-colors duration-150 h-auto"
              onClick={() => handleLanguageSelect(language)}
            >
              <span className="mr-2 w-5 text-center">{getLanguageIcon(language)}</span>
              <span className="capitalize">{language}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button 
            className="bg-accent hover:bg-accent-light text-white"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageModal;
