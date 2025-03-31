# Quotient - Collaborative Code Editor

Quotient is a powerful online code editor that supports over 15 programming languages with real-time collaboration features, allowing multiple developers to work on the same file simultaneously.

## Features

- Real-time collaboration with multiple users
- Support for 15+ programming languages
- Code execution for JavaScript, TypeScript, and Python
- Project organization with files and folders
- Share projects with team members
- User authentication system

## Running Locally

This project can be run using either the TypeScript or JavaScript server implementation.

### Prerequisites

- Node.js (version 16 or later)
- npm (included with Node.js)

### Quick Start

1. Clone the repository
2. Run the installation script:
   ```
   ./install.sh
   ```
3. Choose one of the following options:

   **Option 1:** Run with TypeScript server (default)
   ```
   npm run dev
   ```

   **Option 2:** Run with JavaScript server
   ```
   ./start-js-server.sh
   ```

4. Open your browser to `http://localhost:5000`

### Manual Installation

If the quick start scripts don't work for you:

1. Install dependencies for the main project:
   ```
   npm install
   ```

2. If using JavaScript server, also install its dependencies:
   ```
   cd js-server
   npm install
   cd ..
   ```

3. Start the server:
   - TypeScript: `npm run dev`
   - JavaScript: 
     - Terminal 1: `cd js-server && npm run dev`
     - Terminal 2: `node start-frontend.js`

## Project Structure

- `/client` - React frontend
- `/server` - TypeScript server (Express)
- `/js-server` - JavaScript server implementation (Express)
- `/shared` - Shared types and schemas

## Default Login

- Username: `demo`
- Password: `demo123`

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express (Node.js)
- **Database**: In-memory storage (can be replaced with PostgreSQL)
- **Real-time**: WebSockets
- **Authentication**: Passport.js, express-session
- **Forms**: react-hook-form with Zod validation
- **State Management**: React Query

## License

MIT"# Quotient" 
