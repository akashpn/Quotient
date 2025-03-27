import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Project, File, InsertFile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ProjectContextProps {
  projects: Project[];
  projectFiles: File[];
  activeProject: Project | null;
  loadingProjects: boolean;
  loadingFiles: boolean;
  setActiveProject: (projectId: number) => void;
  createProject: (name: string) => Promise<Project>;
  createFile: (file: Omit<InsertFile, 'id'>) => Promise<File>;
  createFolder: (name: string, projectId: number) => Promise<void>;
  deleteFile: (fileId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { toast } = useToast();
  
  // Fetch projects
  const { 
    data: projects = [],
    isLoading: loadingProjects
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch files for active project
  const {
    data: projectFiles = [],
    isLoading: loadingFiles
  } = useQuery<File[]>({
    queryKey: ['/api/projects', activeProject?.id, 'files'],
    queryFn: async () => {
      if (!activeProject?.id) return [];
      const response = await fetch(`/api/projects/${activeProject.id}/files`);
      if (!response.ok) {
        throw new Error('Failed to fetch project files');
      }
      return response.json();
    },
    enabled: !!activeProject?.id,
  });
  
  // Set the first project as active when projects load
  useEffect(() => {
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
  }, [projects]);
  
  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', '/api/projects', { 
        name, 
        ownerId: 1 // Default user ID
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create project',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
  
  // Create a new file
  const createFileMutation = useMutation({
    mutationFn: async (file: Omit<InsertFile, 'id'>) => {
      const res = await apiRequest('POST', '/api/files', file);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/projects', variables.projectId, 'files'] 
      });
      toast({
        title: 'File created',
        description: `${variables.name} has been created successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create file',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
  
  // Create a new folder (in memory representation as we don't have real folders)
  const createFolderMutation = useMutation({
    mutationFn: async (args: { name: string, projectId: number }) => {
      // This is a placeholder - in a real application, you would create a folder entity
      // Here we just show a toast
      toast({
        title: 'Folder created',
        description: `${args.name} folder has been created.`
      });
    }
  });
  
  // Delete a file
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: (_, fileId) => {
      const file = projectFiles.find(f => f.id === fileId);
      if (file && activeProject) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/projects', activeProject.id, 'files'] 
        });
        toast({
          title: 'File deleted',
          description: `${file.name} has been deleted.`
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete file',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
  
  const handleSetActiveProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };
  
  const createProject = async (name: string) => {
    return createProjectMutation.mutateAsync(name);
  };
  
  const createFile = async (file: Omit<InsertFile, 'id'>) => {
    return createFileMutation.mutateAsync(file);
  };
  
  const createFolder = async (name: string, projectId: number) => {
    await createFolderMutation.mutateAsync({ name, projectId });
  };
  
  const deleteFile = async (fileId: number) => {
    await deleteFileMutation.mutateAsync(fileId);
  };
  
  return (
    <ProjectContext.Provider
      value={{
        projects,
        projectFiles,
        activeProject,
        loadingProjects,
        loadingFiles,
        setActiveProject: handleSetActiveProject,
        createProject,
        createFile,
        createFolder,
        deleteFile
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
