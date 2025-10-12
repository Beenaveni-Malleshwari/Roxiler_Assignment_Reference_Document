const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const signup = (req, res) => {
  const { name, email, password, address } = req.body;
  
  // Check if user already exists
  db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    bcrypt.hash(password, 12, (hashErr, hashedPassword) => {
      if (hashErr) {
        return res.status(500).json({ error: 'Error hashing password' });
      }

      // Insert new user with 'user' role
      db.run(
        'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, 'user'],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '24h' });
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, name, email, role: 'user' }
          });
        }
      );
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  });
};

const updatePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  db.get('SELECT password FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    bcrypt.compare(oldPassword, user.password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      bcrypt.hash(newPassword, 12, (hashErr, hashedPassword) => {
        if (hashErr) {
          return res.status(500).json({ error: 'Error hashing password' });
        }

        db.run('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, userId], function(updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: 'Error updating password' });
          }
          res.json({ message: 'Password updated successfully' });
        });
      });
    });
  });
};

module.exports = { signup, login, updatePassword };