const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database...');

// Check if Users table exists and has data
db.all('SELECT * FROM Users', (err, rows) => {
  if (err) {
    console.log('Error accessing Users table:', err.message);
  } else {
    console.log('Users in database:');
    console.log(rows);
  }
  
  db.close();
});