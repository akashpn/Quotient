export type Language = {
  id: string;
  name: string;
  extension: string;
};

export const supportedLanguages: Language[] = [
  { id: "JavaScript", name: "JavaScript", extension: ".js" },
  { id: "Python", name: "Python", extension: ".py" },
  { id: "Java", name: "Java", extension: ".java" },
  { id: "C++", name: "C++", extension: ".cpp" },
  { id: "Go", name: "Go", extension: ".go" },
  { id: "PHP", name: "PHP", extension: ".php" },
  { id: "Ruby", name: "Ruby", extension: ".rb" },
  { id: "Swift", name: "Swift", extension: ".swift" },
  { id: "TypeScript", name: "TypeScript", extension: ".ts" },
  { id: "Rust", name: "Rust", extension: ".rs" },
  { id: "Kotlin", name: "Kotlin", extension: ".kt" },
  { id: "C#", name: "C#", extension: ".cs" },
  { id: "Scala", name: "Scala", extension: ".scala" },
  { id: "HTML", name: "HTML", extension: ".html" },
  { id: "CSS", name: "CSS", extension: ".css" },
];

export function getLanguageById(id: string): Language {
  return supportedLanguages.find(lang => lang.id === id) || supportedLanguages[0];
}

export function getLanguageByExtension(filename: string): Language {
  const extension = filename.substring(filename.lastIndexOf('.'));
  return supportedLanguages.find(lang => lang.extension === extension) || supportedLanguages[0];
}

export function getMonacoLanguage(languageId: string): string {
  // Map our language IDs to Monaco's language IDs
  const map: Record<string, string> = {
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'Go': 'go',
    'PHP': 'php',
    'Ruby': 'ruby',
    'Swift': 'swift',
    'Rust': 'rust',
    'Kotlin': 'kotlin',
    'C#': 'csharp',
    'Scala': 'scala',
    'HTML': 'html',
    'CSS': 'css'
  };
  
  return map[languageId] || 'plaintext';
}
