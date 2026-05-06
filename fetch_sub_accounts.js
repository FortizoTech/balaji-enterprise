const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Load env
const secretKey = process.env.MODEM_PAY_LIVE_SECRET_KEY || process.env.MODEM_PAY_TEST_SECRET_KEY || process.env.MODEM_PAY_SECRET_KEY;

if (!secretKey) {
    console.log("No secret key found in environment variables.");
    process.exit(1);
}

const options = {
    hostname: 'api.modempay.com',
    path: '/v1/sub-accounts',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            console.log(JSON.parse(data));
        } catch (e) {
            console.log("Error parsing response:", data);
        }
    });
});

req.on('error', process.stderr.write);
req.end();
