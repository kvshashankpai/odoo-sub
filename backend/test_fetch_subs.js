const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function testFetch() {
    try {
        console.log('Testing GET /api/subscriptions...');
        const listRes = await makeRequest('/api/subscriptions');
        console.log(`STATUS: ${listRes.statusCode}`);

        if (listRes.statusCode !== 200) {
            console.error('Failed to fetch list:', listRes.body);
            return;
        }

        const subscriptions = JSON.parse(listRes.body);
        console.log(`Found ${subscriptions.length} subscriptions.`);

        if (subscriptions.length > 0) {
            const lastSub = subscriptions[0]; // Get the most recent one
            console.log(`Testing GET /api/subscriptions/${lastSub.id}...`);

            const detailRes = await makeRequest(`/api/subscriptions/${lastSub.id}`);
            console.log(`STATUS: ${detailRes.statusCode}`);
            console.log('Body:', detailRes.body);
        } else {
            console.log('No subscriptions found to test detail view.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testFetch();
