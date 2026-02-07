const http = require('http');

const data = JSON.stringify({
    customer_name: 'Test Client',
    billing_cycle: 'Monthly',
    start_date: '2023-10-27',
    total_amount: 500
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/subscriptions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
