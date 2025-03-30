export function projectRoutes(app, storage, authMiddleware) {
  // Get all projects
  app.get('/api/projects', authMiddleware, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      
      // Filter projects for the current user
      const userProjects = projects.filter(project => 
        project.ownerId === req.user.id
      );
      
      res.json(userProjects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get project by ID
  app.get('/api/projects/:id', authMiddleware, async (req, res) => {
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
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new project
  app.post('/api/projects', authMiddleware, async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      
      const project = await storage.createProject({
        name,
        ownerId: req.user.id,
        description: req.body.description || '',
        isPublic: req.body.isPublic === true
      });
      
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a project
  app.patch('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner can update project details
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only the owner can update the project' });
      }
      
      const updatedProject = await storage.updateProject(projectId, {
        name: req.body.name !== undefined ? req.body.name : project.name,
        description: req.body.description !== undefined ? req.body.description : project.description,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : project.isPublic
      });
      
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a project
  app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner can delete a project
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only the owner can delete the project' });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get collaborators for a project
  app.get('/api/projects/:id/collaborators', authMiddleware, async (req, res) => {
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
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add a collaborator to a project
  app.post('/api/projects/:id/collaborators', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { userId, role } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner can add collaborators
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only the owner can add collaborators' });
      }
      
      await storage.addCollaborator(projectId, userId, role || 'editor');
      
      const collaborators = await storage.getProjectCollaborators(projectId);
      res.status(201).json(collaborators);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Remove a collaborator from a project
  app.delete('/api/projects/:id/collaborators/:userId', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner can remove collaborators
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only the owner can remove collaborators' });
      }
      
      await storage.removeCollaborator(projectId, userId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create an invitation link
  app.post('/api/projects/:id/invitations', authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Only the owner can create invitations
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only the owner can create invitations' });
      }
      
      const token = await storage.createInvitation(projectId, email);
      
      res.status(201).json({
        token,
        projectId,
        email,
        inviteUrl: `${req.protocol}://${req.get('host')}/invite/${token}`
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}