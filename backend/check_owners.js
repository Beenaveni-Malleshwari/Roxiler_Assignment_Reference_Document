const axios = require('axios');

async function run() {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@roxiler.com', password: 'Admin@123' });
    const token = login.data.token;
    const owners = await axios.get('http://localhost:5000/api/admin/users?role=owner', { headers: { Authorization: `Bearer ${token}` } });
    console.log('owners:', owners.data);
  } catch (e) {
    console.error('err', e.response ? e.response.data : e.message);
  }
}

run();
