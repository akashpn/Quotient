import { 
  users, projects, files, 
  type User, type InsertUser, 
  type Project, type InsertProject, 
  type File, type InsertFile,
  type SupportedLanguage
} from "@shared/schema";

// IStorage interface with CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<File>): Promise<File>;
  updateFileContent(id: number, content: string): Promise<File>;
  deleteFile(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private userId: number;
  private projectId: number;
  private fileId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.userId = 1;
    this.projectId = 1;
    this.fileId = 1;
    
    // Create default demo data
    this.initializeDemoData();
  }
  
  private async initializeDemoData() {
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
      name: "main.js",
      path: "/",
      language: "javascript",
      content: "// Welcome to Quotient Code Editor\n\nconsole.log('Hello, world!');\n",
      projectId: demoProject.id
    });
    
    await this.createFile({
      name: "index.html",
      path: "/",
      language: "html",
      content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Demo Page</title>\n</head>\n<body>\n  <h1>Welcome to Quotient</h1>\n  <p>This is a demo HTML file.</p>\n</body>\n</html>",
      projectId: demoProject.id
    });
    
    await this.createFile({
      name: "style.css",
      path: "/",
      language: "css",
      content: "/* Demo CSS file */\n\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}\n",
      projectId: demoProject.id
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<void> {
    if (!this.projects.has(id)) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    // Delete all files belonging to this project
    const projectFiles = await this.getFilesByProject(id);
    for (const file of projectFiles) {
      await this.deleteFile(file.id);
    }
    
    this.projects.delete(id);
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId);
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileId++;
    const file: File = { 
      id,
      name: insertFile.name,
      path: insertFile.path,
      language: insertFile.language,
      projectId: insertFile.projectId,
      content: insertFile.content || "",
      lastModified: new Date()
    };
    this.files.set(id, file);
    return file;
  }
  
  async updateFile(id: number, fileUpdate: Partial<File>): Promise<File> {
    const file = await this.getFile(id);
    if (!file) {
      throw new Error(`File with ID ${id} not found`);
    }
    
    const updatedFile = { 
      ...file, 
      ...fileUpdate,
      lastModified: new Date()
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  
  async updateFileContent(id: number, content: string): Promise<File> {
    return this.updateFile(id, { content });
  }
  
  async deleteFile(id: number): Promise<void> {
    if (!this.files.has(id)) {
      throw new Error(`File with ID ${id} not found`);
    }
    
    this.files.delete(id);
  }
}

export const storage = new MemStorage();
