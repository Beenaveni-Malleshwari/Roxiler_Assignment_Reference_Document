const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Setting up database...');

// Drop tables if they exist (for clean setup)
db.serialize(() => {
  db.run('DROP TABLE IF EXISTS Ratings');
  db.run('DROP TABLE IF EXISTS Stores');
  db.run('DROP TABLE IF EXISTS Users');

  // Create Users table
  db.run(`CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT CHECK(length(address) <= 400),
    role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'owner'))
  )`);

  // Create Stores table
  db.run(`CREATE TABLE Stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
    email TEXT UNIQUE NOT NULL,
    address TEXT CHECK(length(address) <= 400),
    owner_id INTEGER REFERENCES Users(id) ON DELETE CASCADE
  )`);

  // Create Ratings table
  db.run(`CREATE TABLE Ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES Stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
  )`);

  // Create indexes
  db.run('CREATE INDEX idx_users_email ON Users(email)');
  db.run('CREATE INDEX idx_stores_name ON Stores(name)');
  db.run('CREATE INDEX idx_ratings_store_id ON Ratings(store_id)');
  db.run('CREATE INDEX idx_ratings_user_id ON Ratings(user_id)');

  // Insert admin user
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  db.run(
    'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['System Administrator Account', 'admin@roxiler.com', hashedPassword, 'Roxiler Systems, Bangalore', 'admin'],
    function(err) {
      if (err) {
        console.log('Error creating admin user:', err.message);
      } else {
        console.log('Admin user created successfully with ID:', this.lastID);
        console.log('Email: admin@roxiler.com');
        console.log('Password: Admin@123');
      }
    }
  );

  // Insert a sample store owner
  const ownerPassword = bcrypt.hashSync('Owner@123', 10);
  db.run(
    'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['Store Owner Professional Business Account', 'owner@store.com', ownerPassword, '123 Business Street, City', 'owner'],
    function(err) {
      if (err) {
        console.log('Error creating owner user:', err.message);
      } else {
        const ownerId = this.lastID;
        console.log('Owner user created with ID:', ownerId);
        
        // Insert a sample store for the owner
        db.run(
          'INSERT INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
          ['Premium Retail Store and Shopping Center', 'store@business.com', '456 Market Avenue, Downtown', ownerId],
          function(err) {
            if (err) {
              console.log('Error creating store:', err.message);
            } else {
              console.log('Sample store created with ID:', this.lastID);
            }
          }
        );
      }
    }
  );

  // Check all users after setup
  db.all('SELECT id, name, email, role FROM Users', (err, rows) => {
    if (err) {
      console.log('Error reading users:', err.message);
    } else {
      console.log('\nAll users in database:');
      console.log(rows);
    }
    
    db.close();
    console.log('\nDatabase setup completed!');
  });
});