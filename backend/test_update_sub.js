const http = require('http');

const data = JSON.stringify({
    customer_name: 'Updated Client',
    billing_cycle: 'Yearly',
    total_amount: 999.99
});

function updateSubscription(id) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/subscriptions/${id}`,
        method: 'PUT',
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
}

// Get the first subscription ID first
http.get('http://localhost:5000/api/subscriptions', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const subs = JSON.parse(body);
        if (subs.length > 0) {
            console.log(`Updating subscription #${subs[0].id}...`);
            updateSubscription(subs[0].id);
        } else {
            console.log("No subscriptions found to update.");
        }
    });
});
