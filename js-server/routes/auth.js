import passport from 'passport';
import bcrypt from 'bcryptjs';

export function authRoutes(app, storage) {
  // Register route
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Username and password are required'
        });
      }
      
      if (username.length < 3) {
        return res.status(400).json({
          message: 'Username must be at least 3 characters'
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters'
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username already exists'
        });
      }
      
      // Create user
      const user = await storage.createUser({
        username,
        password
      });
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      // Log in the user
      req.login(userResponse, (err) => {
        if (err) return next(err);
        res.status(201).json(userResponse);
      });
    } catch (err) {
      next(err);
    }
  });
  
  // Login route
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || 'Invalid username or password'
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.status(200).json(userResponse);
      });
    })(req, res, next);
  });
  
  // Logout route
  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  
  // Get current user
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    // Remove password from response
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json(userResponse);
  });
  
  // Get user by ID
  app.get('/api/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const userResponse = { 
      id: user.id, 
      username: user.username 
    };
    
    res.json(userResponse);
  });
}