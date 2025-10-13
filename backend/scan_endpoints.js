const axios = require('axios');
const API = 'http://localhost:5000/api';

async function run() {
  try {
    console.log('1) Health');
    const health = await axios.get(`${API}/health`);
    console.log('  status', health.status, health.data);

    console.log('2) Admin login');
    const adminLogin = await axios.post(`${API}/auth/login`, { email: 'admin@roxiler.com', password: 'Admin@123' });
    const adminToken = adminLogin.data.token;
    console.log('  status', adminLogin.status);

    console.log('3) List admin users');
    const users = await axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('  status', users.status, 'count', users.data.length);

    console.log('4) Create test user via admin');
    const name = `Scan User ${Date.now()} LongEnoughNameTest`;
    const createUser = await axios.post(`${API}/admin/users`, { name, email: `scanuser+${Date.now()}@example.com`, password: 'Password1!', role: 'user' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('  status', createUser.status, createUser.data.user.email);

    console.log('5) Signup via public endpoint (valid payload)');
    const signupName = `Public Signup ${Date.now()} LongNameOK`;
    const signup = await axios.post(`${API}/auth/signup`, { name: signupName, email: `signup+${Date.now()}@example.com`, password: 'Password1!' });
    console.log('  status', signup.status, signup.data.user && signup.data.user.email);

    console.log('6) Login as created user');
    const login = await axios.post(`${API}/auth/login`, { email: createUser.data.user.email, password: 'Password1!' });
    const userToken = login.data.token;
    console.log('  status', login.status);

    console.log('7) Get stores as user');
    const stores = await axios.get(`${API}/user/stores`, { headers: { Authorization: `Bearer ${userToken}` } });
    console.log('  status', stores.status, 'stores', stores.data.length);

    console.log('8) Submit rating (should upsert)');
    // ensure there's at least one store; if none, create one via admin
    let storeId = stores.data && stores.data.length ? (stores.data[0].id || stores.data[0].store_id || stores.data[0].id) : null;
    if (!storeId) {
      const ownerResp = await axios.post(`${API}/admin/users`, { name: `Owner ${Date.now()} LongName`, email: `owner-scan+${Date.now()}@example.com`, password: 'Owner@123', role: 'owner' }, { headers: { Authorization: `Bearer ${adminToken}` } });
      const ownerId = ownerResp.data.user.id;
      const storeResp = await axios.post(`${API}/admin/stores`, { name: `Scan Store ${Date.now()}`, email: `scanstore+${Date.now()}@example.com`, address: 'Scan Addr', owner_id: ownerId }, { headers: { Authorization: `Bearer ${adminToken}` } });
      storeId = (storeResp.data && storeResp.data.store && storeResp.data.store.id) || storeResp.data.id;
    }

    const r1 = await axios.post(`${API}/user/ratings`, { store_id: storeId, rating: 4 }, { headers: { Authorization: `Bearer ${userToken}` } });
    console.log('  rating insert status', r1.status, r1.data);
    const r2 = await axios.post(`${API}/user/ratings`, { store_id: storeId, rating: 5 }, { headers: { Authorization: `Bearer ${userToken}` } });
    console.log('  rating update status', r2.status, r2.data);

    console.log('Scan completed successfully');
  } catch (err) {
    console.error('--- Scan error ---');
    if (err.config) {
      console.error('Request:', err.config.method && err.config.method.toUpperCase(), err.config.url);
    }
    if (err.response) {
      console.error('ERROR RESPONSE', err.response.status);
      console.error('Response data:', err.response.data);
    }
    console.error('Error message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    process.exit(1);
  }
}

run();
