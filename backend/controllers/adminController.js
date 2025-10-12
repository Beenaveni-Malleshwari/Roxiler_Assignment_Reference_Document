const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

const getDashboardStats = (req, res) => {
  const queries = {
    usersCount: 'SELECT COUNT(*) as count FROM Users',
    storesCount: 'SELECT COUNT(*) as count FROM Stores',
    ratingsCount: 'SELECT COUNT(*) as count FROM Ratings'
  };

  db.serialize(() => {
    let stats = {};
    
    db.get(queries.usersCount, (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.usersCount = row.count;
      
      db.get(queries.storesCount, (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.storesCount = row.count;
        
        db.get(queries.ratingsCount, (err, row) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.ratingsCount = row.count;
          res.json(stats);
        });
      });
    });
  });
};

const addUser = (req, res) => {
  const { name, email, password, address, role } = req.body;

  db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(400).json({ error: 'User already exists' });

    bcrypt.hash(password, 12, (hashErr, hashedPassword) => {
      if (hashErr) return res.status(500).json({ error: 'Error hashing password' });

      db.run(
        'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, role],
        function(insertErr) {
          if (insertErr) return res.status(500).json({ error: 'Error creating user' });
          
          res.status(201).json({
            message: 'User created successfully',
            user: { id: this.lastID, name, email, role, address }
          });
        }
      );
    });
  });
};

const getStores = (req, res) => {
  const { name, email, sort = 'name:asc' } = req.query;
  let query = `
    SELECT s.*, u.name as owner_name, 
           AVG(r.rating) as average_rating,
           COUNT(r.rating) as rating_count
    FROM Stores s
    LEFT JOIN Users u ON s.owner_id = u.id
    LEFT JOIN Ratings r ON s.id = r.store_id
  `;
  
  const conditions = [];
  const params = [];

  if (name) {
    conditions.push('s.name LIKE ?');
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push('s.email = ?');
    params.push(email);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY s.id';

  // Handle sorting
  const [sortField, sortOrder] = sort.split(':');
  const validSortFields = ['name', 'email', 'average_rating'];
  if (validSortFields.includes(sortField)) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating).toFixed(2) : null
    })));
  });
};

const addStore = (req, res) => {
  const { name, email, address, owner_id } = req.body;

  db.get('SELECT id FROM Stores WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(400).json({ error: 'Store already exists with this email' });

    // Verify owner exists and has owner role
    db.get('SELECT id, role FROM Users WHERE id = ?', [owner_id], (err, owner) => {
      if (err || !owner) return res.status(400).json({ error: 'Invalid owner' });
      if (owner.role !== 'owner') return res.status(400).json({ error: 'User must have owner role' });

      db.run(
        'INSERT INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [name, email, address, owner_id],
        function(insertErr) {
          if (insertErr) return res.status(500).json({ error: 'Error creating store' });
          
          res.status(201).json({
            message: 'Store created successfully',
            store: { id: this.lastID, name, email, address, owner_id }
          });
        }
      );
    });
  });
};

const getUsers = (req, res) => {
  const { name, email, role, sort = 'name:asc' } = req.query;
  let query = 'SELECT id, name, email, address, role FROM Users WHERE 1=1';
  const params = [];

  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    query += ' AND email = ?';
    params.push(email);
  }
  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  // Handle sorting
  const [sortField, sortOrder] = sort.split(':');
  const validSortFields = ['name', 'email', 'role'];
  if (validSortFields.includes(sortField)) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};

const getUserDetails = (req, res) => {
  const userId = req.params.id;

  db.get(
    `SELECT u.*, s.name as store_name, s.id as store_id 
     FROM Users u 
     LEFT JOIN Stores s ON u.id = s.owner_id 
     WHERE u.id = ?`,
    [userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // If user is an owner, get store ratings
      if (user.role === 'owner' && user.store_id) {
        db.all(
          `SELECT r.rating, r.created_at, u.name as user_name 
           FROM Ratings r 
           JOIN Users u ON r.user_id = u.id 
           WHERE r.store_id = ? 
           ORDER BY r.created_at DESC`,
          [user.store_id],
          (err, ratings) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ ...user, store_ratings: ratings });
          }
        );
      } else {
        res.json(user);
      }
    }
  );
};

module.exports = {
  getDashboardStats,
  addUser,
  getStores,
  addStore,
  getUsers,
  getUserDetails
};