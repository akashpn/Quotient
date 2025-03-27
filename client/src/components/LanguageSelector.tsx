import { useContext } from "react";
import { EditorContext } from "../contexts/EditorContext";
import { supportedLanguages } from "../lib/languages";

export default function LanguageSelector() {
  const { currentFile, setLanguage } = useContext(EditorContext);
  
  if (!currentFile) return null;
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(currentFile.id, e.target.value);
  };
  
  return (
    <div className="relative">
      <select 
        className="appearance-none bg-dark-border px-2 py-1.5 pr-8 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        value={currentFile.language}
        onChange={handleLanguageChange}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
}
