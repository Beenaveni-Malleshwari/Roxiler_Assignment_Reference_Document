const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.abort();
});

req.end();
