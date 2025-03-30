import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temporary directory for code execution
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure the temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating temp directory:', error);
  }
}

// Helper function to execute shell commands
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject(new Error('Execution timed out'));
      } else if (error && error.code !== 0) {
        reject(new Error(stderr || error.message));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// JavaScript execution
async function executeJavaScript(code) {
  await ensureTempDir();
  
  const filename = `${uuidv4()}.js`;
  const filePath = path.join(TEMP_DIR, filename);
  
  try {
    await fs.writeFile(filePath, code);
    const { stdout, stderr } = await execCommand(`node ${filePath}`);
    
    if (stderr) {
      console.warn('JavaScript execution warning:', stderr);
    }
    
    return stdout;
  } catch (error) {
    throw error;
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }
  }
}

// TypeScript execution
async function executeTypeScript(code) {
  await ensureTempDir();
  
  const tsFilename = `${uuidv4()}.ts`;
  const jsFilename = `${uuidv4()}.js`;
  const tsFilePath = path.join(TEMP_DIR, tsFilename);
  const jsFilePath = path.join(TEMP_DIR, jsFilename);
  
  try {
    await fs.writeFile(tsFilePath, code);
    
    // Transpile TypeScript to JavaScript
    await execCommand(`esbuild ${tsFilePath} --outfile=${jsFilePath}`);
    
    // Execute the JavaScript
    const { stdout, stderr } = await execCommand(`node ${jsFilePath}`);
    
    if (stderr) {
      console.warn('TypeScript execution warning:', stderr);
    }
    
    return stdout;
  } catch (error) {
    throw error;
  } finally {
    try {
      await fs.unlink(tsFilePath).catch(() => {});
      await fs.unlink(jsFilePath).catch(() => {});
    } catch (error) {
      console.error('Error deleting temp files:', error);
    }
  }
}

// Python execution
async function executePython(code) {
  await ensureTempDir();
  
  const filename = `${uuidv4()}.py`;
  const filePath = path.join(TEMP_DIR, filename);
  
  try {
    await fs.writeFile(filePath, code);
    const { stdout, stderr } = await execCommand(`python3 ${filePath}`);
    
    if (stderr) {
      console.warn('Python execution warning:', stderr);
    }
    
    return stdout;
  } catch (error) {
    throw error;
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }
  }
}

// Main execution function that handles different languages
export async function executeCode(code, language) {
  try {
    switch (language.toLowerCase()) {
      case 'javascript':
        return await executeJavaScript(code);
        
      case 'typescript':
        return await executeTypeScript(code);
        
      case 'python':
        return await executePython(code);
        
      default:
        throw new Error(`Execution for language '${language}' is not supported`);
    }
  } catch (error) {
    throw error;
  }
}

// Initialize the temp directory on module load
ensureTempDir();