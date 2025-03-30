import bcrypt from 'bcryptjs';
import createMemoryStore from 'memorystore';
import session from 'express-session';

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.collaborators = new Map(); // key is `${projectId}:${userId}`
    this.invitations = new Map();
    this.userId = 1;
    this.projectId = 1;
    this.fileId = 1;
    this.collaboratorId = 1;
    
    // Create default demo data
    this.initializeDemoData();
  }
  
  async initializeDemoData() {
    // Create a demo user
    const demoUser = await this.createUser({ 
      username: "demo", 
      password: "demo123" 
    });
    
    // Create a demo project
    const demoProject = await this.createProject({
      name: "Demo Project",
      ownerId: demoUser.id
    });
    
    // Create some demo files
    await this.createFile({
      name: "index.js",
      path: "/",
      language: "javascript",
      content: "// Welcome to Quotient Code Editor\n\nconsole.log('Hello, world!');\n",
      projectId: demoProject.id
    });
    
    await this.createFile({
      name: "app.js",
      path: "/",
      language: "javascript",
      content: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello from Express!');\n});\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});\n",
      projectId: demoProject.id
    });
    
    await this.createFile({
      name: "example.py",
      path: "/",
      language: "python",
      content: "# Python example\n\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"World\"))\n",
      projectId: demoProject.id
    });
  }
  
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  
  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(userData) {
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    const id = this.userId++;
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = { 
      ...userData, 
      password: hashedPassword,
      id,
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Project operations
  async getProject(id) {
    return this.projects.get(id);
  }
  
  async getAllProjects() {
    return Array.from(this.projects.values());
  }
  
  async createProject(projectData) {
    const id = this.projectId++;
    const project = { 
      ...projectData, 
      id,
      createdAt: new Date()
    };
    
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id, projectUpdate) {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id) {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Delete all files associated with this project
    const filesToDelete = [];
    for (const [fileId, file] of this.files.entries()) {
      if (file.projectId === id) {
        filesToDelete.push(fileId);
      }
    }
    
    for (const fileId of filesToDelete) {
      this.files.delete(fileId);
    }
    
    // Delete all collaborator relationships
    const collaboratorKeys = Array.from(this.collaborators.keys())
      .filter(key => key.startsWith(`${id}:`));
    
    for (const key of collaboratorKeys) {
      this.collaborators.delete(key);
    }
    
    this.projects.delete(id);
  }
  
  // File operations
  async getFile(id) {
    return this.files.get(id);
  }
  
  async getFilesByProject(projectId) {
    const projectFiles = [];
    for (const file of this.files.values()) {
      if (file.projectId === projectId) {
        projectFiles.push(file);
      }
    }
    return projectFiles;
  }
  
  async createFile(fileData) {
    const id = this.fileId++;
    const file = { 
      ...fileData, 
      id,
      createdAt: new Date()
    };
    
    this.files.set(id, file);
    return file;
  }
  
  async updateFile(id, fileUpdate) {
    const file = await this.getFile(id);
    if (!file) {
      throw new Error("File not found");
    }
    
    const updatedFile = { ...file, ...fileUpdate };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  
  async updateFileContent(id, content) {
    const file = await this.getFile(id);
    if (!file) {
      throw new Error("File not found");
    }
    
    const updatedFile = { ...file, content };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteFile(id) {
    const file = await this.getFile(id);
    if (!file) {
      throw new Error("File not found");
    }
    
    this.files.delete(id);
  }
  
  // Collaboration operations
  async getProjectCollaborators(projectId) {
    const collaboratorIds = [];
    for (const [key, collab] of this.collaborators.entries()) {
      if (key.startsWith(`${projectId}:`)) {
        collaboratorIds.push(collab.userId);
      }
    }
    
    const collaborators = [];
    for (const id of collaboratorIds) {
      const user = await this.getUser(id);
      if (user) {
        collaborators.push(user);
      }
    }
    
    return collaborators;
  }
  
  async addCollaborator(projectId, userId, role = 'editor') {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const key = `${projectId}:${userId}`;
    const collaborator = {
      id: this.collaboratorId++,
      projectId,
      userId,
      role,
      createdAt: new Date()
    };
    
    this.collaborators.set(key, collaborator);
  }
  
  async removeCollaborator(projectId, userId) {
    const key = `${projectId}:${userId}`;
    if (!this.collaborators.has(key)) {
      throw new Error("Collaborator not found");
    }
    
    this.collaborators.delete(key);
  }
  
  async createInvitation(projectId, email) {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const token = Math.random().toString(36).substring(2, 15);
    this.invitations.set(token, { projectId, email, token });
    
    return token;
  }
}

// Export single instance for server-wide use
export const storage = new MemStorage();