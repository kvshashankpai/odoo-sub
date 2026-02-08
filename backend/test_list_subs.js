const http = require('http');

http.get('http://localhost:5000/api/subscriptions', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Response Body:', body);
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
