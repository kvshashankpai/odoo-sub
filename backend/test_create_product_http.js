const http = require('http');

function testCreateProduct() {
    const data = JSON.stringify({
        name: 'Youtube Premium Test',
        type: 'Consumable',
        salePrice: 110,
        costPrice: 67,
        notes: 'youtube without ad test',
        tax: 5
    });

    const options = {
        hostname: 'localhost',
        port: 5002, // Using a different port to test continuously
        path: '/api/products',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log('BODY:', body);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
}

testCreateProduct();
