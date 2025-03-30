import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import createMemoryStore from 'memorystore';
import { createRoutes } from './routes/index.js';
import { MemStorage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize storage
const storage = new MemStorage();

// Initialize Express app
const app = express();
app.use(express.json());

// Session configuration
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // Prune expired entries every 24h
});

// Generate a random session secret
const SESSION_SECRET = process.env.SESSION_SECRET || 
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Invalid username' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid password' });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server, 
  path: '/ws',
  verifyClient: () => true // Allow connection from any origin
});

// Register routes
createRoutes(app, storage, wss);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, storage };