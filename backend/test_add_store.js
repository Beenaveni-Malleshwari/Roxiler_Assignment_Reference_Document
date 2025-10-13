const axios = require('axios');

const API = 'http://localhost:5000/api';

async function run() {
  try {
    // Admin login
    const login = await axios.post(`${API}/auth/login`, { email: 'admin@roxiler.com', password: 'Admin@123' });
    const token = login.data.token;
    console.log('Admin logged in');

    // Get owners
    const ownersResp = await axios.get(`${API}/admin/users?role=owner`, { headers: { Authorization: `Bearer ${token}` } });
    const owners = ownersResp.data;
    console.log('Owners found:', owners.length);
    if (owners.length === 0) {
      console.log('No owners available to assign.');
      return;
    }

    const ownerId = owners[0].id;

    // Create store payload
    const payload = {
      name: `Test Store ${Date.now()} Long Name Enough`,
      email: `teststore+${Date.now()}@example.com`,
      address: '123 Test Street',
      owner_id: ownerId
    };

    const storeResp = await axios.post(`${API}/admin/stores`, payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Store created:', storeResp.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status', err.response.status, err.response.data);
    } else {
      console.error('Error', err.message);
    }
  }
}

run();
