import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName: string;
}

export function ShareDialog({ open, onOpenChange, projectId, projectName }: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && projectId) {
      // Generate share link - in a real app, this might include a token
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/invite/${projectId}`);
    }
  }, [open, projectId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  const inviteByEmail = async () => {
    if (!email) return;
    
    setInviting(true);
    
    try {
      const response = await apiRequest('POST', '/api/projects/invite', {
        projectId,
        email,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invitation');
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on "{projectName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="link">Share Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button size="icon" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">Invite by Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                placeholder="colleague@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                size="icon" 
                onClick={inviteByEmail}
                disabled={inviting || !email}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}