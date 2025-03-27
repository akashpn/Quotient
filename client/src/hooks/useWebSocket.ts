import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookOptions {
  url: string;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  autoConnect?: boolean;
}

interface WebSocketHookReturn {
  sendMessage: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  url,
  onOpen,
  onClose,
  onMessage,
  onError,
  reconnectInterval = 3000,
  reconnectAttempts = 5,
  autoConnect = true,
}: WebSocketHookOptions): WebSocketHookReturn {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    // Create a new WebSocket
    const socket = new WebSocket(url);
    
    // Set up event handlers
    socket.onopen = (event) => {
      setReadyState(WebSocket.OPEN);
      reconnectCountRef.current = 0;
      onOpen?.(event);
    };
    
    socket.onclose = (event) => {
      setReadyState(WebSocket.CLOSED);
      onClose?.(event);
      
      // Attempt to reconnect if not closed cleanly and within reconnect attempts
      if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current += 1;
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => connect(), reconnectInterval);
      }
    };
    
    socket.onmessage = (event) => {
      setLastMessage(event);
      onMessage?.(event);
    };
    
    socket.onerror = (event) => {
      onError?.(event);
    };
    
    socketRef.current = socket;
  }, [url, onOpen, onClose, onMessage, onError, reconnectAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);
  
  // Send message function
  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(data);
      } else {
        console.error('WebSocket is not connected. Cannot send message.');
      }
    },
    []
  );
  
  return {
    sendMessage,
    lastMessage,
    readyState,
    connect,
    disconnect,
  };
}
