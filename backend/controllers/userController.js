const { db } = require('../config/database');

const getStores = (req, res) => {
  const { search } = req.query;
  const userId = req.user.id;

  let query = `
    SELECT s.*, 
           AVG(r_all.rating) as overall_rating,
           r_user.rating as user_rating
    FROM Stores s
    LEFT JOIN Ratings r_all ON s.id = r_all.store_id
    LEFT JOIN Ratings r_user ON s.id = r_user.store_id AND r_user.user_id = ?
  `;

  const params = [userId];

  if (search) {
    query += ' WHERE s.name LIKE ? OR s.address LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' GROUP BY s.id ORDER BY s.name';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows.map(row => ({
      ...row,
      overall_rating: row.overall_rating ? parseFloat(row.overall_rating).toFixed(2) : null
    })));
  });
};

const submitRating = (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;

  // Check if store exists
  db.get('SELECT id FROM Stores WHERE id = ?', [store_id], (err, store) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    // Use SQLite upsert to atomically insert or update the rating
    const sql = `
      INSERT INTO Ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, store_id) DO UPDATE SET
        rating = excluded.rating,
        created_at = CURRENT_TIMESTAMP
    `;

    db.run(sql, [user_id, store_id, rating], function(err) {
      if (err) {
        console.error('Error upserting rating:', err);
        return res.status(500).json({ error: 'Error submitting rating' });
      }

      // If a new row was inserted, lastID will be set; otherwise treat as updated
      if (this.lastID) {
        return res.status(201).json({ message: 'Rating submitted successfully' });
      }
      return res.json({ message: 'Rating updated successfully' });
    });
  });
};

const updateRating = (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const user_id = req.user.id;

  db.run(
    'UPDATE Ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
    [rating, user_id, storeId],
    function(updateErr) {
      if (updateErr) return res.status(500).json({ error: 'Error updating rating' });
      if (this.changes === 0) return res.status(404).json({ error: 'Rating not found' });
      
      res.json({ message: 'Rating updated successfully' });
    }
  );
};

module.exports = { getStores, submitRating, updateRating };