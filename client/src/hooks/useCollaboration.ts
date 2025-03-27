import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { generateRandomColor } from "@/lib/utils";

type CursorPosition = {
  lineNumber: number;
  column: number;
};

type CursorUpdate = {
  fileId: string;
  position: CursorPosition;
};

type Collaborator = {
  id: string;
  name: string;
  color: string;
  cursor?: {
    fileId: string;
    position: CursorPosition;
  };
};

export function useCollaboration() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [userId, setUserId] = useState<string>("");
  const { connected, sendMessage, onMessage } = useWebSocket();
  const { toast } = useToast();

  // Initialize user
  useEffect(() => {
    // Generate a random user ID and name (in a real app, this would come from auth)
    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
    
    // Join the collaboration session
    if (connected) {
      const color = generateRandomColor();
      const name = `User ${Math.floor(Math.random() * 1000)}`;
      
      sendMessage("join", { 
        userId: newUserId,
        name,
        color
      });
    }
  }, [connected, sendMessage]);

  // Handle collaborator joining
  useEffect(() => {
    const removeJoinListener = onMessage("user_joined", (payload) => {
      setCollaborators(prev => {
        // Check if user already exists
        if (prev.some(collab => collab.id === payload.userId)) {
          return prev;
        }
        
        // Add new collaborator
        const newCollaborator: Collaborator = {
          id: payload.userId,
          name: payload.name,
          color: payload.color
        };
        
        // Show toast notification
        if (payload.userId !== userId) {
          toast({
            title: "Collaborator joined",
            description: `${payload.name} has joined the session`,
            duration: 3000
          });
        }
        
        return [...prev, newCollaborator];
      });
    });

    return removeJoinListener;
  }, [onMessage, userId, toast]);

  // Handle collaborator leaving
  useEffect(() => {
    const removeLeaveListener = onMessage("user_left", (payload) => {
      setCollaborators(prev => {
        const filtered = prev.filter(collab => collab.id !== payload.userId);
        
        // Find the collaborator who left
        const leftCollaborator = prev.find(collab => collab.id === payload.userId);
        if (leftCollaborator) {
          toast({
            title: "Collaborator left",
            description: `${leftCollaborator.name} has left the session`,
            duration: 3000
          });
        }
        
        return filtered;
      });
    });

    return removeLeaveListener;
  }, [onMessage, toast]);

  // Handle cursor updates
  useEffect(() => {
    const removeCursorListener = onMessage("cursor_update", (payload) => {
      if (payload.userId === userId) return; // Ignore own cursor updates
      
      setCollaborators(prev => 
        prev.map(collab => 
          collab.id === payload.userId 
            ? { ...collab, cursor: payload.cursor } 
            : collab
        )
      );
    });

    return removeCursorListener;
  }, [onMessage, userId]);

  // Handle code updates
  useEffect(() => {
    const removeCodeListener = onMessage("code_update", (payload) => {
      // This will be handled in the EditorContext
    });

    return removeCodeListener;
  }, [onMessage]);

  // Send cursor position update
  const sendCursorUpdate = useCallback((cursor: CursorUpdate) => {
    sendMessage("cursor_update", {
      userId,
      cursor
    });
  }, [sendMessage, userId]);

  // Send code update
  const sendCodeUpdate = useCallback((fileId: string, content: string) => {
    sendMessage("code_update", {
      userId,
      fileId,
      content
    });
  }, [sendMessage, userId]);

  return {
    userId,
    collaborators,
    connected,
    sendCursorUpdate,
    sendCodeUpdate
  };
}
