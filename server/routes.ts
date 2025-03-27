import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from 'ws';
import { messageSchema, supportedLanguages, type Message } from '@shared/schema';
import { log } from './vite';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { executeJavaScript, executeTypeScript, executePython } from './execution';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for collaborative editing
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Allow connection from any origin
    verifyClient: () => true 
  });
  
  // Map to store all active connections by file ID
  const fileConnections = new Map<number, Map<number, WebSocket>>();
  // Map to store user information
  const activeUsers = new Map<WebSocket, { userId: number, username: string }>();
  
  wss.on('connection', async (ws) => {
    log('WebSocket client connected', 'ws');
    
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
        const validatedMessage = messageSchema.parse(message);
        
        // Store user info when they join
        if (validatedMessage.type === 'join') {
          const { userId, username, fileId } = validatedMessage;
          
          activeUsers.set(ws, { userId, username });
          
          // Add user to file connections
          if (fileId) {
            if (!fileConnections.has(fileId)) {
              fileConnections.set(fileId, new Map());
            }
            fileConnections.get(fileId)?.set(userId, ws);
            
            // Send list of active users in this file to the new user
            const activeFileUsers = Array.from(fileConnections.get(fileId)?.entries() || [])
              .map(([uid, _]) => {
                const user = Array.from(activeUsers.entries())
                  .find(([_, info]) => info.userId === uid);
                return user ? user[1] : null;
              })
              .filter(Boolean);
            
            ws.send(JSON.stringify({
              type: 'users_list',
              data: activeFileUsers
            }));
            
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
          
          log(`User ${username} (${userId}) joined file ${fileId}`, 'ws');
        }
        
        // Broadcast message to all clients viewing the same file
        if (validatedMessage.fileId) {
          const fileClients = fileConnections.get(validatedMessage.fileId);
          
          if (fileClients) {
            fileClients.forEach((client, uid) => {
              // Don't send message back to the sender
              if (uid !== validatedMessage.userId && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
              }
            });
          }
          
          // If it's an edit message, update file content in storage
          if (validatedMessage.type === 'edit' && validatedMessage.fileId) {
            const fileId = validatedMessage.fileId;
            const file = await storage.getFile(fileId);
            
            if (file) {
              const newContent = validatedMessage.data.content;
              await storage.updateFileContent(fileId, newContent);
            }
          }
          
          // If it's a save message, explicitly save the file
          if (validatedMessage.type === 'save' && validatedMessage.fileId) {
            const fileId = validatedMessage.fileId;
            const newContent = validatedMessage.data.content;
            await storage.updateFileContent(fileId, newContent);
            
            // Notify clients that the file was saved
            fileClients?.forEach((client, uid) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'saved',
                  fileId: validatedMessage.fileId,
                  userId: validatedMessage.userId,
                  username: validatedMessage.username,
                  timestamp: Date.now()
                }));
              }
            });
          }
        }
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          ws.send(JSON.stringify({
            type: 'error',
            message: validationError.message
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
        log(`Error processing WebSocket message: ${error}`, 'ws');
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
            clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'leave',
                  userId,
                  username,
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
        log(`User ${username} (${userId}) disconnected`, 'ws');
      }
    });
  });
  
  // API routes
  app.get('/api/languages', (req, res) => {
    res.json(supportedLanguages);
  });
  
  // Projects API
  app.post('/api/projects', async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get('/api/projects', async (req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });
  
  app.get('/api/projects/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  });
  
  // Files API
  app.post('/api/files', async (req, res) => {
    try {
      const file = await storage.createFile(req.body);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get('/api/projects/:projectId/files', async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const files = await storage.getFilesByProject(projectId);
    res.json(files);
  });
  
  app.get('/api/files/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const file = await storage.getFile(id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json(file);
  });
  
  app.put('/api/files/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const file = await storage.updateFile(id, req.body);
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.delete('/api/files/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteFile(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ id: user.id, username: user.username });
  });
  
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
        // Execute code based on language
        switch (language) {
          case 'javascript':
            // Execute JavaScript with Node.js
            result = await executeJavaScript(code);
            break;
          case 'python':
            // Execute Python
            result = await executePython(code);
            break;
          case 'typescript':
            // Execute TypeScript
            result = await executeTypeScript(code);
            break;
          default:
            return res.status(400).json({ 
              error: `Language '${language}' is not supported for execution` 
            });
        }
      } catch (err) {
        error = (err as Error).message;
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
        details: (error as Error).message 
      });
    }
  });
  
  return httpServer;
}
