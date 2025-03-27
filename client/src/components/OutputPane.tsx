import { useContext } from "react";
import { EditorContext } from "../contexts/EditorContext";
import { motion } from "framer-motion";

export default function OutputPane() {
  const { currentFile, output, runCode, clearOutput } = useContext(EditorContext);
  
  return (
    <>
      {/* Output Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-lighter">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">Output</span>
          {currentFile && (
            <div className="language-tag bg-accent-blue bg-opacity-20 text-accent-blue">
              {currentFile.language}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <motion.button 
            className="p-1.5 rounded hover:bg-dark-border transition-colors" 
            title="Clear output"
            onClick={clearOutput}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </motion.button>
          <motion.button 
            className="p-1.5 rounded hover:bg-dark-border transition-colors" 
            title="Share output"
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Console Output */}
      <div className="h-full bg-dark-lighter font-mono p-4 overflow-auto scrollbar-thin text-sm">
        {output.length === 0 ? (
          <div className="text-gray-500 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <p>Run your code to see output here</p>
            <motion.button 
              className="mt-4 px-4 py-2 bg-primary rounded text-white font-medium hover:bg-opacity-90 transition-colors"
              onClick={() => currentFile && runCode(currentFile.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Run Code
            </motion.button>
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} className={`${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
              {line.content}
            </div>
          ))
        )}
      </div>
    </>
  );
}
