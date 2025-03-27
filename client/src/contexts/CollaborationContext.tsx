import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useEditorContext } from './EditorContext';
import { type Message } from '@shared/schema';

interface CursorPosition {
  lineNumber: number;
  column: number;
}

interface Selection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface Collaborator {
  userId: number;
  username: string;
  fileId: number;
  cursor?: CursorPosition;
  selection?: Selection;
  lastActivity: number;
}

interface CollaborationEvent {
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: number;
}

interface CollaborationContextProps {
  collaborators: Collaborator[];
  isConnected: boolean;
  sendEdit: (fileId: number, content: string, isSave?: boolean) => void;
  sendCursor: (fileId: number, position: CursorPosition) => void;
  sendSelection: (fileId: number, selection: Selection) => void;
  collaborationEvents: CollaborationEvent[];
}

const CollaborationContext = createContext<CollaborationContextProps | undefined>(undefined);

// Mocked user information - in a real app, this would come from authentication
const currentUser = {
  id: 1,
  username: 'CurrentUser'
};

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeFile } = useEditorContext();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Setup WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log('Attempting to connect to WebSocket...');
        // Use the full URL with explicit port
        const host = window.location.hostname;
        const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${host}:${port}/ws`;
        console.log('WebSocket URL:', wsUrl);
        
        const newSocket = new WebSocket(wsUrl);
        
        newSocket.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected successfully');
          
          // Join current file if one is active
          if (activeFile) {
            newSocket.send(JSON.stringify({
              type: 'join',
              userId: currentUser.id,
              username: currentUser.username,
              fileId: activeFile.id,
              data: {},
              timestamp: Date.now()
            }));
          }
        };
        
        newSocket.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected, retrying in 3 seconds...');
          
          // Attempt to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };
        
        newSocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        newSocket.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data as string) as Message;
            
            // Handle different message types
            switch (message.type) {
              case 'cursor':
                updateCollaboratorCursor(message);
                break;
              case 'selection':
                updateCollaboratorSelection(message);
                break;
              case 'edit':
                addCollaborationEvent(message.userId, message.username, 'is editing', `Changed content in ${activeFile?.name || 'current file'}`);
                break;
              case 'join':
                addCollaborationEvent(message.userId, message.username, 'joined', `Now editing ${activeFile?.name || 'current file'}`);
                break;
              case 'leave':
                removeCollaborator(message.userId);
                addCollaborationEvent(message.userId, message.username, 'left', `Stopped editing ${activeFile?.name || 'current file'}`);
                break;
              case 'users_list':
                // Update list of active users in this file
                const usersList = message.data as { userId: number, username: string }[];
                const newCollaborators = usersList
                  .filter(user => user.userId !== currentUser.id) // Filter out current user
                  .map(user => ({
                    userId: user.userId,
                    username: user.username,
                    fileId: activeFile?.id || 0,
                    lastActivity: Date.now()
                  }));
                
                setCollaborators(prev => [
                  ...prev.filter(c => !newCollaborators.some(nc => nc.userId === c.userId)),
                  ...newCollaborators
                ]);
                break;
              case 'saved':
                addCollaborationEvent(message.userId, message.username, 'saved', `Saved ${activeFile?.name || 'current file'}`);
                break;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        setSocket(newSocket);
        
        return () => {
          newSocket.close();
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
        return () => {};
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  // Join/leave files when the active file changes
  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !activeFile) return;
    
    // Send leave message for any previous file
    const previousFileIds = Array.from(new Set(
      collaborators
        .filter(c => c.fileId !== activeFile.id)
        .map(c => c.fileId)
    ));
    
    for (const fileId of previousFileIds) {
      socket.send(JSON.stringify({
        type: 'leave',
        userId: currentUser.id,
        username: currentUser.username,
        fileId,
        data: {},
        timestamp: Date.now()
      }));
    }
    
    // Clear collaborators that are not in the current file
    setCollaborators(prev => prev.filter(c => c.fileId === activeFile.id));
    
    // Join the new file
    socket.send(JSON.stringify({
      type: 'join',
      userId: currentUser.id,
      username: currentUser.username,
      fileId: activeFile.id,
      data: {},
      timestamp: Date.now()
    }));
  }, [activeFile?.id, socket]);
  
  // Helper functions to update collaborator state
  const updateCollaboratorCursor = (message: Message) => {
    const { userId, username, fileId, data } = message;
    if (!fileId || !data.cursor) return;
    
    setCollaborators(prev => {
      const existing = prev.find(c => c.userId === userId && c.fileId === fileId);
      
      if (existing) {
        return prev.map(c => 
          c.userId === userId && c.fileId === fileId
            ? { ...c, cursor: data.cursor, lastActivity: Date.now() }
            : c
        );
      } else {
        return [
          ...prev,
          {
            userId,
            username,
            fileId,
            cursor: data.cursor,
            lastActivity: Date.now()
          }
        ];
      }
    });
  };
  
  const updateCollaboratorSelection = (message: Message) => {
    const { userId, username, fileId, data } = message;
    if (!fileId || !data.selection) return;
    
    setCollaborators(prev => {
      const existing = prev.find(c => c.userId === userId && c.fileId === fileId);
      
      if (existing) {
        return prev.map(c => 
          c.userId === userId && c.fileId === fileId
            ? { ...c, selection: data.selection, lastActivity: Date.now() }
            : c
        );
      } else {
        return [
          ...prev,
          {
            userId,
            username,
            fileId,
            selection: data.selection,
            lastActivity: Date.now()
          }
        ];
      }
    });
  };
  
  const removeCollaborator = (userId: number) => {
    setCollaborators(prev => prev.filter(c => c.userId !== userId));
  };
  
  // Helper to add collaboration events for the UI
  const addCollaborationEvent = (
    userId: number, 
    username: string, 
    action: string, 
    details: string
  ) => {
    const event: CollaborationEvent = {
      userId,
      username,
      action,
      details,
      timestamp: Date.now()
    };
    
    setCollaborationEvents(prev => [...prev.slice(-9), event]);
  };
  
  // API to send events to other collaborators
  const sendEdit = (fileId: number, content: string, isSave = false) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(JSON.stringify({
      type: isSave ? 'save' : 'edit',
      userId: currentUser.id,
      username: currentUser.username,
      fileId,
      data: { content },
      timestamp: Date.now()
    }));
  };
  
  const sendCursor = (fileId: number, position: CursorPosition) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(JSON.stringify({
      type: 'cursor',
      userId: currentUser.id,
      username: currentUser.username,
      fileId,
      data: { cursor: position },
      timestamp: Date.now()
    }));
  };
  
  const sendSelection = (fileId: number, selection: Selection) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(JSON.stringify({
      type: 'selection',
      userId: currentUser.id,
      username: currentUser.username,
      fileId,
      data: { selection },
      timestamp: Date.now()
    }));
  };
  
  return (
    <CollaborationContext.Provider
      value={{
        collaborators,
        isConnected,
        sendEdit,
        sendCursor,
        sendSelection,
        collaborationEvents
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaborationContext must be used within a CollaborationProvider');
  }
  return context;
};
