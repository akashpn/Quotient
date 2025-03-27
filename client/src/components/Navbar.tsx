import { useContext } from "react";
import { CollaborationContext } from "../contexts/CollaborationContext";
import CollaboratorAvatar from "./CollaboratorAvatar";

export default function Navbar() {
  const { collaborators, connected } = useContext(CollaborationContext);
  
  return (
    <header className="fixed top-0 w-full bg-dark-lighter border-b border-dark-border flex items-center justify-between px-4 h-12 z-20">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.48 13.03C19.46 13.01 19.35 12.88 19.24 12.67L16.07 6.9C15.96 6.68 15.86 6.53 15.69 6.39C15.5 6.24 15.27 6.15 15.05 6.15C14.7 6.15 14.42 6.32 14.24 6.6L11.07 12.32L7.93 6.6C7.75 6.32 7.47 6.15 7.12 6.15C6.9 6.15 6.67 6.24 6.47 6.39C6.31 6.53 6.21 6.68 6.1 6.9L2.93 12.67C2.82 12.88 2.71 13.01 2.69 13.03C2.67 13.05 2.61 13.11 2.59 13.15C2.57 13.19 2.55 13.24 2.55 13.28C2.55 13.44 2.61 13.59 2.71 13.69C2.82 13.79 2.96 13.85 3.12 13.85C3.29 13.85 3.45 13.77 3.56 13.65L7.12 8.5L10.27 14.22C10.45 14.5 10.73 14.67 11.07 14.67C11.42 14.67 11.7 14.5 11.88 14.22L15.05 8.5L18.61 13.65C18.72 13.77 18.88 13.85 19.05 13.85C19.22 13.85 19.36 13.79 19.46 13.69C19.56 13.59 19.62 13.44 19.62 13.28C19.62 13.24 19.6 13.19 19.58 13.15C19.56 13.11 19.5 13.05 19.48 13.03Z"/>
            </svg>
            <span className="font-semibold text-xl text-white tracking-tighter">Quotient</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <button className="px-3 py-1 text-sm rounded hover:bg-dark-border transition-colors">File</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-dark-border transition-colors">Edit</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-dark-border transition-colors">View</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-dark-border transition-colors">Run</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-dark-border transition-colors">Share</button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Active Collaborators */}
        <div className="hidden md:flex items-center -space-x-2 mr-2">
          {collaborators.slice(0, 3).map((collab, index) => (
            <CollaboratorAvatar key={collab.id} name={collab.name} color={collab.color} />
          ))}
          
          {collaborators.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center border-2 border-dark-lighter text-white text-xs font-medium">
              +{collaborators.length - 3}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="hidden sm:flex items-center">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-secondary animate-pulse-subtle' : 'bg-destructive'} mr-1.5`}></div>
          <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Share Button */}
        <button className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-primary rounded-md text-white text-sm font-medium hover:bg-opacity-80 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          <span>Share</span>
        </button>

        {/* Settings Menu */}
        <button className="p-1.5 rounded-full hover:bg-dark-border transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* User Menu */}
        <button className="p-1 rounded-full hover:bg-dark-border transition-colors">
          <div className="w-7 h-7 rounded-full bg-accent-blue flex items-center justify-center text-white font-medium">
            JD
          </div>
        </button>
      </div>
    </header>
  );
}
