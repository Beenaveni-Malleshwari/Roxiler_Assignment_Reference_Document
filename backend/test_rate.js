const axios = require('axios');

const API = 'http://localhost:5000/api';

async function run() {
  try {
    // Login as admin to create a store if needed
    const adminLogin = await axios.post(`${API}/auth/login`, { email: 'admin@roxiler.com', password: 'Admin@123' });
    const adminToken = adminLogin.data.token;
    console.log('Admin logged in');

    // Create an owner user so the store can be assigned an owner
    const ownerName = `Owner Account ${Date.now()} TestNameLongEnough`;
    const createOwnerResp = await axios.post(
      `${API}/admin/users`,
      { name: ownerName, email: `owner${Date.now()}@example.com`, password: 'Owner@123', role: 'owner' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const ownerId = createOwnerResp.data.user.id;

    // Create a store (owned by the created owner) - must satisfy validation rules
    const storeResp = await axios.post(
      `${API}/admin/stores`,
      { name: `Test Store For Ratings ${Date.now()}`, email: `store${Date.now()}@example.com`, address: '123 Test Lane', owner_id: ownerId },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

  console.log('Store created or returned:', storeResp.data);
  const storeId = (storeResp.data && storeResp.data.store && storeResp.data.store.id) || storeResp.data.id || storeResp.data.insertId || storeResp.data.storeId;

    // Create a normal user via admin API so we can login and submit ratings
    const userName = `Rate Tester ${Date.now()} LongNameEnough`;
    const createUserResp = await axios.post(
      `${API}/admin/users`,
      { name: userName, email: `ratetester+${Date.now()}@example.com`, password: 'Password1!', role: 'user' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Admin created user:', createUserResp.data.user.email);

    // Login as the created user
    const userLogin = await axios.post(`${API}/auth/login`, { email: createUserResp.data.user.email, password: 'Password1!' });
    const userToken = userLogin.data.token;
    console.log('User logged in');

  // Submit rating as user
    const rating1 = await axios.post(
      `${API}/user/ratings`,
      { store_id: storeId, rating: 4 },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('First rating response:', rating1.data);

    // Submit rating again (update)
    const rating2 = await axios.post(
      `${API}/user/ratings`,
      { store_id: storeId, rating: 5 },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('Second rating response:', rating2.data);

    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Request error:', err.response.status);
      if (err.response.config) {
        console.error('Failed request:', err.response.config.method.toUpperCase(), err.response.config.url);
      }
      console.error('Response data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

run();
