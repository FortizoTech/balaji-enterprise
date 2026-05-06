import fs from 'fs';
import path from 'path';

let env = '';
try {
    env = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
    try {
        env = fs.readFileSync('.env', 'utf-8');
    } catch (e) { }
}

const secretKeyMatch = env.match(/MODEM_PAY_LIVE_SECRET_KEY=([^\n]+)/) || env.match(/MODEM_PAY_TEST_SECRET_KEY=([^\n]+)/) || env.match(/MODEM_PAY_SECRET_KEY=([^\n]+)/);
const secretKey = secretKeyMatch ? secretKeyMatch[1].trim() : process.env.MODEM_PAY_SECRET_KEY;

if (!secretKey) {
    console.log("No secret key found.");
    process.exit(1);
}

const url = 'https://api.modempay.com/v1/sub-accounts';
console.log("Fetching from:", url);

try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
        }
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Data:", text);
} catch (e) {
    console.log("Fetch error:", e);
}
