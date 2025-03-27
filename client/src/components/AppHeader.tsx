import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Plus } from "lucide-react";
import { useProjectContext } from '@/contexts/ProjectContext';

interface AppHeaderProps {
  onOpenShareDialog?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenShareDialog }) => {
  const { activeProject } = useProjectContext();

  return (
    <header className="bg-secondary border-b border-gray-800 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <div className="text-2xl font-bold mr-4">
            <span className="text-indigo-500">Q</span><span className="text-foreground">uotient</span>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost" className="px-3 py-1 text-sm text-primary h-auto">
              File
            </Button>
            <Button variant="ghost" className="px-3 py-1 text-sm text-primary h-auto">
              Edit
            </Button>
            <Button variant="ghost" className="px-3 py-1 text-sm text-primary h-auto">
              View
            </Button>
            <Button variant="ghost" className="px-3 py-1 text-sm text-primary h-auto">
              Run
            </Button>
            <Button variant="ghost" className="px-3 py-1 text-sm text-primary h-auto">
              Help
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Collaborators Avatars */}
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white border-2 border-primary-bg" title="Alex Smith">AS</div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white border-2 border-primary-bg" title="Maria Garcia">MG</div>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white border-2 border-primary-bg" title="John Doe">JD</div>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-primary-bg" title="Invite more">
              <Plus className="h-4 w-4" />
            </div>
          </div>
          
          {/* Share Button */}
          <Button 
            className="hidden md:flex items-center bg-accent hover:bg-accent-light text-white rounded-md px-3 py-1.5 text-sm h-auto"
            onClick={onOpenShareDialog}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </Button>
          
          {/* User Profile */}
          <div className="relative">
            <Button variant="ghost" className="w-8 h-8 rounded-full bg-neutral flex items-center justify-center p-0">
              <span className="text-xs font-medium">YS</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
