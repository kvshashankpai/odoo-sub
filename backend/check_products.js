const axios = require('axios');

async function checkProducts() {
    try {
        const res = await axios.get('http://localhost:5000/api/products');
        console.log('Products:', res.data);
    } catch (err) {
        console.error('Error fetching products:', err.message);
    }
}

checkProducts();
