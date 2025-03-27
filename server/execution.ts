import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { resolve } from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Executes JavaScript code in Node.js
 */
export const executeJavaScript = async (code: string): Promise<string> => {
  // Create a temporary file to execute
  const tempFile = resolve(`.temp_${Date.now()}.js`);
  
  try {
    // Write code to a temporary file
    await writeFile(tempFile, code);
    
    // Execute the code
    const { stdout, stderr } = await execPromise(`node ${tempFile}`);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    return stdout.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error executing JavaScript code');
  } finally {
    // Clean up: remove temporary file
    try {
      await unlink(tempFile);
    } catch (e) {
      console.error('Error removing temporary file:', e);
    }
  }
};

/**
 * Executes TypeScript code by transpiling it to JavaScript first
 */
export const executeTypeScript = async (code: string): Promise<string> => {
  // Create temporary files
  const tempTsFile = resolve(`.temp_${Date.now()}.ts`);
  const tempJsFile = resolve(`.temp_${Date.now()}.js`);
  
  try {
    // Write TypeScript code to a temporary file
    await writeFile(tempTsFile, code);
    
    // Transpile TypeScript to JavaScript using tsc
    try {
      await execPromise(`npx esbuild ${tempTsFile} --outfile=${tempJsFile}`);
    } catch (transpileError) {
      throw new Error(`TypeScript compilation error: ${(transpileError as Error).message}`);
    }
    
    // Execute the JavaScript output
    const { stdout, stderr } = await execPromise(`node ${tempJsFile}`);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    return stdout.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error executing TypeScript code');
  } finally {
    // Clean up: remove temporary files
    try {
      await unlink(tempTsFile).catch(() => {});
      await unlink(tempJsFile).catch(() => {});
    } catch (e) {
      console.error('Error removing temporary files:', e);
    }
  }
};

/**
 * Executes Python code
 */
export const executePython = async (code: string): Promise<string> => {
  // Create a temporary file to execute
  const tempFile = resolve(`.temp_${Date.now()}.py`);
  
  try {
    // Write code to a temporary file
    await writeFile(tempFile, code);
    
    // Execute the code
    const { stdout, stderr } = await execPromise(`python ${tempFile}`);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    return stdout.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error executing Python code');
  } finally {
    // Clean up: remove temporary file
    try {
      await unlink(tempFile);
    } catch (e) {
      console.error('Error removing temporary file:', e);
    }
  }
};