import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/Editor";
import { EditorProvider } from "@/contexts/EditorContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Editor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <EditorProvider>
          <CollaborationProvider>
            <Router />
            <Toaster />
          </CollaborationProvider>
        </EditorProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
