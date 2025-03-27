# Quotient - Collaborative Code Editor

Quotient is a modern, real-time collaborative code editor that supports 15 programming languages. It's built with React, TailwindCSS, and Express, offering a robust and intuitive environment for coding together.

![Quotient Code Editor](./screenshot.png)

## Features

- **Real-time Collaboration**: Multiple users can edit the same file simultaneously
- **15 Programming Languages**: Full support for JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, HTML, CSS, JSON, and Markdown
- **Code Execution**: Run JavaScript, TypeScript, and Python code directly in the editor
- **Syntax Highlighting**: Powered by Monaco Editor (the engine behind VS Code)
- **Project Management**: Create and organize projects and files
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/quotient.git
cd quotient
```

2. Install dependencies:

```bash
npm install
# or with yarn
yarn
```

3. Start the development server:

```bash
npm run dev
# or with yarn
yarn dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
.
├── client                # Frontend React application
│   ├── src
│   │   ├── components    # UI components
│   │   ├── contexts      # React context providers
│   │   ├── hooks         # Custom React hooks
│   │   ├── lib           # Utility libraries
│   │   ├── pages         # Page components
│   │   └── utils         # Helper functions
│   └── index.html        # HTML entry point
├── server                # Backend Express application
│   ├── execution.ts      # Code execution service
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage interface
│   └── vite.ts           # Vite configuration
├── shared                # Shared code between client and server
│   └── schema.ts         # Data models and types
└── package.json          # Project dependencies and scripts
```

## WebSocket Communication

The real-time collaboration is powered by WebSockets. The WebSocket server handles various event types:

- `join`: When a user joins a file for editing
- `edit`: When a user makes changes to a file
- `cursor`: When a user moves their cursor
- `selection`: When a user selects text
- `save`: When a file is saved
- `leave`: When a user leaves a file

## Code Execution

The code execution feature works by:

1. Sending code to the server via the `/api/execute` endpoint
2. The server creates a temporary file
3. The file is executed using the appropriate runtime (Node.js, Python, etc.)
4. Results are captured and sent back to the client
5. The temporary file is deleted

## Development Notes

- The client uses Vite for fast development and building
- TailwindCSS and shadcn/ui are used for styling
- Monaco Editor is used for the code editor component
- Drizzle ORM and Zod are used for data validation

## License

[MIT](LICENSE)

## Acknowledgments

- [Monaco Editor](https://github.com/microsoft/monaco-editor)
- [React](https://reactjs.org)
- [Express](https://expressjs.com)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)