const bcrypt = require('bcryptjs');
const { db } = require('./config/database');

const owners = [
  { name: 'Demo Owner One Long Name', email: 'owner1@roxiler.com', password: 'Owner@123' },
  { name: 'Demo Owner Two Long Name', email: 'owner2@roxiler.com', password: 'Owner@123' }
];

function createOwner(owner) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM Users WHERE email = ?', [owner.email], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve({ skipped: true, email: owner.email });

      bcrypt.hash(owner.password, 12, (hashErr, hashed) => {
        if (hashErr) return reject(hashErr);
        db.run('INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', [owner.name, owner.email, hashed, 'owner'], function(insertErr) {
          if (insertErr) return reject(insertErr);
          resolve({ inserted: true, id: this.lastID, email: owner.email });
        });
      });
    });
  });
}

(async () => {
  for (const o of owners) {
    try {
      const r = await createOwner(o);
      console.log(r);
    } catch (e) {
      console.error('Error creating owner', o.email, e);
    }
  }
  process.exit(0);
})();
