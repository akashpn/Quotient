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
    case 'c':
      return '// C file\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n';
    case 'cpp':
      return '// C++ file\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n';
    case 'csharp':
      return '// C# file\n\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}\n';
    case 'go':
      return '// Go file\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}\n';
    case 'rust':
      return '// Rust file\n\nfn main() {\n    println!("Hello from Rust!");\n}\n';
    case 'ruby':
      return '# Ruby file\n\nputs "Hello from Ruby!"\n';
    case 'php':
      return '<?php\n// PHP file\n\necho "Hello from PHP!";\n?>\n';
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
  return ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'markdown'].includes(language);
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
    case 'html':
      return '<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample HTML</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is a sample HTML document.</p>\n</body>\n</html>\n';
    case 'css':
      return 'body {\n  font-family: Arial, sans-serif;\n  color: #333;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: navy;\n  margin-bottom: 20px;\n}\n';
    case 'json':
      return '{\n  "name": "John",\n  "age": 30,\n  "city": "New York",\n  "skills": ["JavaScript", "HTML", "CSS"],\n  "active": true\n}\n';
    case 'markdown':
      return '# Sample Markdown\n\n## Introduction\n\nThis is a sample markdown file.\n\n- Item 1\n- Item 2\n- Item 3\n\n## Code Example\n\n```javascript\nconsole.log("Hello from Markdown!");\n```\n';
    default:
      return '';
  }
}

// Get Monaco editor language ID from our language ID
export function getMonacoLanguage(language: SupportedLanguage): string {
  const monacoMap: Record<SupportedLanguage, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'csharp',
    go: 'go',
    rust: 'rust',
    ruby: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    json: 'json',
    markdown: 'markdown'
  };
  
  return monacoMap[language] || language;
}

// Get a human-readable name for the language
export function getLanguageDisplayName(language: SupportedLanguage): string {
  const displayNames: Record<SupportedLanguage, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    ruby: 'Ruby',
    php: 'PHP',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    markdown: 'Markdown'
  };
  
  return displayNames[language] || language;
}
