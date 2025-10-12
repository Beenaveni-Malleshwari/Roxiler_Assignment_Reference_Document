const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ensure we point to the backend database file regardless of cwd
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open database:', err.message);
});

db.all('SELECT id, name, email, role FROM Users', (err, rows) => {
  if (err) console.log('Error:', err.message);
  else console.log('Users:', rows);
  db.close();
});
