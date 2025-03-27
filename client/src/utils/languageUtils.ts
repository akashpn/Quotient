import { SupportedLanguage, languageExtMap, languageIconMap } from '@shared/schema';

// Get the file extension from a filename
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

// Get the language from a file extension
export function getLanguageFromExtension(extension: string): SupportedLanguage {
  const languageEntries = Object.entries(languageExtMap) as [SupportedLanguage, string][];
  const language = languageEntries.find(([_, ext]) => ext === extension)?.[0];
  
  return language || 'javascript'; // Default to JavaScript if not found
}

// Get the extension from a language
export function getExtensionFromLanguage(language: SupportedLanguage): string {
  return languageExtMap[language] || 'js'; // Default to .js if not found
}

// Get initial template content for a new file based on language
export function getTemplateForLanguage(language: SupportedLanguage): string {
  switch (language) {
    case 'javascript':
      return '// JavaScript file\n\nconsole.log("Hello from JavaScript!");\n';
    case 'typescript':
      return '// TypeScript file\n\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "John",\n  age: 30\n};\n\nconsole.log(user);\n';
    case 'python':
      return '# Python file\n\ndef main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()\n';
    case 'java':
      return '// Java file\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n';
    case 'html':
      return '<!DOCTYPE html>\n<html>\n<head>\n    <title>New HTML Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n';
    case 'css':
      return '/* CSS file */\n\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    color: #333;\n}\n';
    case 'json':
      return '{\n    "name": "Example",\n    "version": "1.0.0",\n    "description": "Example JSON file"\n}\n';
    case 'markdown':
      return '# Markdown File\n\n## Introduction\n\nThis is a new markdown file.\n\n- Item 1\n- Item 2\n- Item 3\n';
    default:
      return '';
  }
}

// Helper to decide if a language supports execution
export function canExecuteLanguage(language: SupportedLanguage): boolean {
  return ['javascript', 'typescript', 'python'].includes(language);
}

// Get sample code for basic execution in different languages
export function getSampleCodeForLanguage(language: SupportedLanguage): string {
  switch (language) {
    case 'javascript':
      return 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n';
    case 'typescript':
      return 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n';
    case 'python':
      return 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n';
    default:
      return '';
  }
}
