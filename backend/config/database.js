const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Ensure foreign key constraints are enforced by SQLite
db.run('PRAGMA foreign_keys = ON');

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT CHECK(length(address) <= 400),
        role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'owner'))
      )`, (err) => {
        if (err) reject(err);
      });

      // Stores table
      db.run(`CREATE TABLE IF NOT EXISTS Stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
        email TEXT UNIQUE NOT NULL,
        address TEXT CHECK(length(address) <= 400),
        owner_id INTEGER REFERENCES Users(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) reject(err);
      });

      // Ratings table
      db.run(`CREATE TABLE IF NOT EXISTS Ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
        store_id INTEGER REFERENCES Stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Create indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)');
      db.run('CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name)');
      db.run('CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON Ratings(store_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON Ratings(user_id)');

      // Check if admin user exists, if not create one
      db.get('SELECT * FROM Users WHERE email = ?', ['admin@roxiler.com'], (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err);
          reject(err);
          return;
        }
        
        if (!row) {
          const hashedPassword = bcrypt.hashSync('Admin@123', 10);
          db.run(
            'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            ['System Administrator Account', 'admin@roxiler.com', hashedPassword, 'Roxiler Systems, Bangalore', 'admin'],
            function(insertErr) {
              if (insertErr) {
                console.error('Error creating admin user:', insertErr);
                reject(insertErr);
              } else {
                console.log('Default admin user created: admin@roxiler.com / Admin@123');
                resolve();
              }
            }
          );
        } else {
          console.log('Admin user already exists');
          resolve();
        }
      });
    });
  });
};

// Test database connection
db.get('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = { db, initDatabase };