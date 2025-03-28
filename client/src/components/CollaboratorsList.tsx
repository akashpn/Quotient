import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useState } from 'react';
import { ShareDialog } from './ShareDialog';

export function CollaboratorsList() {
  const { collaborators } = useCollaborationContext();
  const { activeProject } = useProjectContext();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Get active collaborators (active in the last 5 minutes)
  const activeCollaborators = collaborators.filter(
    c => (Date.now() - c.lastActivity) < 5 * 60 * 1000
  );
  
  // Generate a color based on username (consistent for same username)
  const getColorFromUsername = (username: string) => {
    const colors = [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-violet-500',
      'bg-cyan-500',
      'bg-fuchsia-500'
    ];
    
    // Hash the username to get a consistent index
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <>
      <div className="flex items-center space-x-3">
        {/* Collaborators Avatars */}
        <div className="flex -space-x-2">
          {activeCollaborators.slice(0, 3).map(collaborator => (
            <TooltipProvider key={collaborator.userId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className={`w-8 h-8 border-2 border-primary-bg ${getColorFromUsername(collaborator.username)}`}>
                    <AvatarFallback>{getInitials(collaborator.username)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{collaborator.username}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {activeCollaborators.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-8 h-8 bg-gray-700 border-2 border-primary-bg">
                    <AvatarFallback>+{activeCollaborators.length - 3}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeCollaborators.length - 3} more collaborators</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {activeCollaborators.length === 0 && (
            <div className="text-sm text-gray-500">No active collaborators</div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-primary-bg"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Invite collaborators</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Share Button */}
        <Button 
          className="hidden md:flex items-center bg-accent hover:bg-accent-light text-white rounded-md px-3 py-1.5 text-sm h-auto"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
      
      {activeProject && (
        <ShareDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen} 
          projectId={activeProject.id} 
          projectName={activeProject.name} 
        />
      )}
    </>
  );
}