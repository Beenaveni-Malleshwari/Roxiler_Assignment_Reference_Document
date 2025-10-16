const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const ownerRoutes = require('./routes/owner');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
    'http://localhost:3000', 
    'https://roxiler-systems-frontend-tp8k.onrender.com', // Your frontend URL
    'https://roxiler-assignment-reference-document2.onrender.com' // Your backend URL (for testing)


));
app.use(express.json());

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/owner', ownerRoutes);

    // Health check route
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running!' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Admin credentials: admin@roxiler.com / Admin@123`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();