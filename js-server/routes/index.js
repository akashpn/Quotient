import passport from 'passport';
import { WebSocket } from 'ws';
import { authRoutes } from './auth.js';
import { projectRoutes } from './projects.js';
import { fileRoutes } from './files.js';
import { executeCode } from '../execution.js';

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

export function createRoutes(app, storage, wss) {
  // Set up authentication routes
  authRoutes(app, storage);
  
  // Set up project routes
  projectRoutes(app, storage, authMiddleware);
  
  // Set up file routes
  fileRoutes(app, storage, authMiddleware);
  
  // Code execution API
  app.post('/api/execute', async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ 
          error: "Missing required parameters (code, language)" 
        });
      }
      
      const startTime = Date.now();
      let result;
      let error = null;
      
      try {
        result = await executeCode(code, language);
      } catch (err) {
        error = err.message;
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      res.json({
        result: result || "",
        error,
        executionTime
      });
    } catch (error) {
      console.error("Execution error:", error);
      res.status(500).json({ 
        error: "Failed to execute code", 
        details: error.message 
      });
    }
  });
  
  // Languages API
  app.get('/api/languages', (req, res) => {
    const supportedLanguages = [
      'javascript',
      'python',
      'typescript',
      'html',
      'css',
      'java',
      'c',
      'cpp',
      'csharp',
      'go',
      'ruby',
      'rust',
      'php',
      'swift',
      'kotlin'
    ];
    
    res.json(supportedLanguages);
  });
  
  // Setup WebSocket server for collaborative editing
  const fileConnections = new Map(); // Map to store all active connections by file ID
  const activeUsers = new Map(); // Map to store user information
  
  wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');
    
    // Set a ping interval to keep connections alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);
    
    // Handle client messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Validate message
        if (!message.type || !message.userId || !message.username) {
          throw new Error('Invalid message format');
        }
        
        // Store user info when they join
        if (message.type === 'join') {
          const { userId, username, fileId } = message;
          
          // Store user info when they connect
          activeUsers.set(ws, { userId, username });
          
          // Add user to file connections
          if (fileId) {
            if (!fileConnections.has(fileId)) {
              fileConnections.set(fileId, new Map());
            }
            fileConnections.get(fileId).set(userId, ws);
            
            // Send list of active users in this file to all users in the file
            const activeFileUsers = Array.from(fileConnections.get(fileId).entries())
              .map(([uid, _]) => {
                const user = Array.from(activeUsers.entries())
                  .find(([_, info]) => info.userId === uid);
                return user ? user[1] : null;
              })
              .filter(Boolean);
              
            // Send to the new user
            ws.send(JSON.stringify({
              type: 'users_list',
              data: activeFileUsers,
              userId: userId,
              username: username,
              fileId: fileId,
              timestamp: Date.now()
            }));
            
            // Also send updated list to all connected clients for this file
            fileConnections.get(fileId).forEach((client, cuid) => {
              if (client.readyState === WebSocket.OPEN && cuid !== userId) {
                client.send(JSON.stringify({
                  type: 'users_list',
                  data: activeFileUsers,
                  userId: 0, // system message
                  username: 'system',
                  fileId: fileId,
                  timestamp: Date.now()
                }));
              }
            });
            
            // Get file content and send it to the user
            if (fileId) {
              const file = await storage.getFile(fileId);
              if (file) {
                ws.send(JSON.stringify({
                  type: 'sync',
                  data: {
                    content: file.content,
                    language: file.language
                  }
                }));
              }
            }
          }
          
          console.log(`User ${username} (${userId}) joined file ${fileId}`);
        }
        
        // Broadcast message to all clients viewing the same file
        if (message.fileId) {
          const fileClients = fileConnections.get(message.fileId);
          
          if (fileClients) {
            fileClients.forEach((client, uid) => {
              // Don't send message back to the sender
              if (uid !== message.userId && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
              }
            });
          }
          
          // If it's an edit message, update file content in storage
          if (message.type === 'edit' && message.fileId) {
            const fileId = message.fileId;
            const file = await storage.getFile(fileId);
            
            if (file) {
              const newContent = message.data.content;
              await storage.updateFileContent(fileId, newContent);
            }
          }
          
          // If it's a save message, explicitly save the file
          if (message.type === 'save' && message.fileId) {
            const fileId = message.fileId;
            const newContent = message.data.content;
            await storage.updateFileContent(fileId, newContent);
            
            // Notify clients that the file was saved
            fileClients.forEach((client, uid) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'saved',
                  fileId: message.fileId,
                  userId: message.userId,
                  username: message.username,
                  timestamp: Date.now()
                }));
              }
            });
          }
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format: ' + error.message
        }));
        console.error(`Error processing WebSocket message: ${error}`);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      clearInterval(pingInterval);
      
      const userInfo = activeUsers.get(ws);
      if (userInfo) {
        const { userId, username } = userInfo;
        
        // Remove user from all file connections
        Array.from(fileConnections.entries()).forEach(([fileId, clients]) => {
          if (clients.has(userId)) {
            clients.delete(userId);
            
            // Notify other clients about the disconnection
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                // Send leave notification
                client.send(JSON.stringify({
                  type: 'leave',
                  userId,
                  username,
                  fileId,
                  timestamp: Date.now()
                }));
                
                // Also send updated users list
                const updatedUsers = Array.from(clients.entries())
                  .map(([uid, _]) => {
                    const userInfo = Array.from(activeUsers.entries())
                      .find(([_, info]) => info.userId === uid);
                    return userInfo ? userInfo[1] : null;
                  })
                  .filter(Boolean);
                  
                client.send(JSON.stringify({
                  type: 'users_list',
                  data: updatedUsers,
                  userId: 0, // system message
                  username: 'system',
                  fileId,
                  timestamp: Date.now()
                }));
              }
            });
            
            // Clean up empty file connections
            if (clients.size === 0) {
              fileConnections.delete(fileId);
            }
          }
        });
        
        activeUsers.delete(ws);
        console.log(`User ${username} (${userId}) disconnected`);
      }
    });
  });
}