import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/Editor";
import AuthPage from "@/pages/auth-page";
import { EditorProvider } from "@/contexts/EditorContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Editor} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <EditorProvider>
            <CollaborationProvider>
              <Router />
              <Toaster />
            </CollaborationProvider>
          </EditorProvider>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
