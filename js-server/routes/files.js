export function fileRoutes(app, storage, authMiddleware) {
  // Get files by project ID
  app.get('/api/projects/:id/files', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is owner or collaborator
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator && !project.isPublic) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      
      const files = await storage.getFilesByProject(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get file by ID
  app.get('/api/files/:id', authMiddleware, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Check if user has access to the project
      const project = await storage.getProject(file.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(file.projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator && !project.isPublic) {
        return res.status(403).json({ message: 'Unauthorized access to file' });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new file
  app.post('/api/projects/:id/files', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { name, path, language, content } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'File name is required' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner or collaborator can create files
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'You do not have permission to create files in this project' });
      }
      
      // Check if file with same name and path already exists
      const projectFiles = await storage.getFilesByProject(projectId);
      const fileExists = projectFiles.some(file => 
        file.name === name && 
        file.path === (path || '/')
      );
      
      if (fileExists) {
        return res.status(400).json({ message: 'File with this name already exists in this directory' });
      }
      
      const file = await storage.createFile({
        name,
        path: path || '/',
        language: language || 'plaintext',
        content: content || '',
        projectId,
        createdById: req.user.id
      });
      
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a file
  app.patch('/api/files/:id', authMiddleware, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Check if user has access to the project
      const project = await storage.getProject(file.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(file.projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'You do not have permission to update this file' });
      }
      
      const updatedFile = await storage.updateFile(fileId, {
        name: req.body.name !== undefined ? req.body.name : file.name,
        path: req.body.path !== undefined ? req.body.path : file.path,
        language: req.body.language !== undefined ? req.body.language : file.language,
        content: req.body.content !== undefined ? req.body.content : file.content
      });
      
      res.json(updatedFile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update file content
  app.patch('/api/files/:id/content', authMiddleware, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (content === undefined) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Check if user has access to the project
      const project = await storage.getProject(file.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(file.projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'You do not have permission to update this file' });
      }
      
      const updatedFile = await storage.updateFileContent(fileId, content);
      res.json(updatedFile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a file
  app.delete('/api/files/:id', authMiddleware, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Check if user has access to the project
      const project = await storage.getProject(file.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const isOwner = project.ownerId === req.user.id;
      const collaborators = await storage.getProjectCollaborators(file.projectId);
      const isCollaborator = collaborators.some(user => user.id === req.user.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'You do not have permission to delete this file' });
      }
      
      await storage.deleteFile(fileId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}