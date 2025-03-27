import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollaborationContext } from '@/contexts/CollaborationContext';

interface CollaborationEvent {
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: number;
}

const CollaborationToast: React.FC = () => {
  const { collaborationEvents } = useCollaborationContext();
  const [visibleEvent, setVisibleEvent] = useState<CollaborationEvent | null>(null);
  const [visible, setVisible] = useState(false);
  
  // Display the most recent event
  useEffect(() => {
    if (collaborationEvents.length > 0 && !visible) {
      const latestEvent = collaborationEvents[collaborationEvents.length - 1];
      setVisibleEvent(latestEvent);
      setVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [collaborationEvents]);
  
  if (!visible || !visibleEvent) return null;
  
  // Generate a deterministic color for the user
  const getUserColor = (userId: number): string => {
    const colors = [
      'bg-emerald-500', // emerald
      'bg-amber-500',   // amber
      'bg-red-500',     // red
      'bg-indigo-500',  // indigo
      'bg-violet-500',  // violet
      'bg-pink-500',    // pink
      'bg-teal-500',    // teal
      'bg-orange-500',  // orange
    ];
    
    return colors[userId % colors.length];
  };
  
  return (
    <div className="fixed bottom-6 right-6 bg-tertiary border border-gray-700 rounded-lg p-3 shadow-lg flex items-center z-50">
      <div className={`w-8 h-8 rounded-full ${getUserColor(visibleEvent.userId)} flex items-center justify-center text-xs text-white mr-3`}>
        {visibleEvent.username.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="text-sm text-foreground">{visibleEvent.username} {visibleEvent.action}</div>
        <div className="text-xs text-muted-foreground">{visibleEvent.details}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-3 text-muted-foreground hover:text-foreground h-5 w-5"
        onClick={() => setVisible(false)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default CollaborationToast;
