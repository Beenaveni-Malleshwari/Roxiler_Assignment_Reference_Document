const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open database:', err.message);
});

const hashedPassword = bcrypt.hashSync('Admin@123', 10);

db.run(
  `INSERT INTO Users (name, email, password, role) 
   VALUES (?, ?, ?, ?)`,
  ['Admin User', 'admin@roxiler.com', hashedPassword, 'admin'],
  function(err) {
    if (err) console.log('Error:', err.message);
    else console.log('Admin created! Email: admin@roxiler.com, Password: Admin@123');
    db.close();
  }
);
