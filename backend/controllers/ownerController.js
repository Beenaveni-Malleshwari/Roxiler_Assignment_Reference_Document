const { db } = require('../config/database');

const getDashboard = (req, res) => {
  const owner_id = req.user.id;

  // Get owner's store
  db.get('SELECT id, name FROM Stores WHERE owner_id = ?', [owner_id], (err, store) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!store) return res.status(404).json({ error: 'No store found for this owner' });

    // Get average rating and raters
    db.get(
      `SELECT AVG(rating) as average_rating, COUNT(*) as rating_count 
       FROM Ratings WHERE store_id = ?`,
      [store.id],
      (err, stats) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Get list of raters
        db.all(
          `SELECT u.name, u.email, r.rating, r.created_at 
           FROM Ratings r 
           JOIN Users u ON r.user_id = u.id 
           WHERE r.store_id = ? 
           ORDER BY r.created_at DESC`,
          [store.id],
          (err, raters) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            res.json({
              store: store.name,
              average_rating: stats.average_rating ? parseFloat(stats.average_rating).toFixed(2) : 0,
              rating_count: stats.rating_count,
              raters: raters
            });
          }
        );
      }
    );
  });
};

module.exports = { getDashboard };