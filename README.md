# Quotient - Collaborative Code Editor

Quotient is a feature-rich online code editor that accommodates more than 15 programming languages with real-time collaboration, enabling several developers to collaborate on the same file at the same time.

## Features

- Real-time collaboration with multiple users
- Support for 15+ programming languages
- Execution of code for JavaScript, TypeScript, and Python
- Project organization with files and folders
- Share projects with team members
- User authentication system

## Running Locally

This project can be executed using either the TypeScript or JavaScript server implementation.

### Prerequisites

- Node.js (version 16 or higher)
- npm (available with Node.js)

### Quick Start

1. Clone the repository
2. Execute the installation script:
   ```
   ./install.sh
   ```
3. Select one of the following options:

   **Option 1:** Run with TypeScript server (default)
   ```
   npm run dev
   ```

**Option 2:** Run with JavaScript server
```bash
./start-js-server.sh
```

4. Go to your browser at `http://localhost:5000`

### Manual Installation

If the quick start scripts do not work for you:

1. Install dependencies for the main project:
   ```bash
   npm install
   ```

2. If running JavaScript server, also install its dependencies:
   ```bash
   cd js-server
   npm install
```
cd.

``` 

3. Run the server:
   - TypeScript: `npm run dev`
   - JavaScript:
     - Terminal 1: `cd js-server && npm run dev`
     - Terminal 2: `node start-frontend.js`

## Project Structure

- `/client` - React frontend
- `/server` - TypeScript server (Express)
- `/js-server` - JavaScript server implementation (Express)
- `/shared` - Shared types and schemas

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express (Node.js)
- **Database**: In-memory storage (can be swapped with PostgreSQL)
- **Real-time**: WebSockets
- **Authentication**: Passport.js, express-session
- **Forms**: react-hook-form with Zod validation
- **State Management**: React Query

## License

MIT"#"Quotient"
