const axios = require('axios');
const API = process.env.API_BASE || 'http://localhost:5000/api';

(async () => {
  try {
    // login as admin
    const login = await axios.post(`${API}/auth/login`, { email: 'admin@roxiler.com', password: 'Admin@123' });
    const token = login.data.token;
    console.log('Admin token acquired');

    const client = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });

    // get admin user details
    const usersRes = await client.get('/admin/users', { params: { email: 'admin@roxiler.com' } });
    const adminUser = usersRes.data && usersRes.data[0];
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }
    console.log('Admin user:', adminUser);

    // try to create a store owned by admin
    const storePayload = {
      name: 'Test Store Owned by Admin 2025-10-13',
      email: `admin-owned-${Date.now()}@example.com`,
      address: '123 Admin Rd',
      owner_id: adminUser.id
    };

    const createRes = await client.post('/admin/stores', storePayload);
    console.log('Store creation response:', createRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
