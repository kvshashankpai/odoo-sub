const axios = require('axios');

async function testCreateProduct() {
    try {
        const payload = {
            name: 'Youtube Premium',
            type: 'Consumable',
            salePrice: 110,
            costPrice: 67,
            tax: 5,
            notes: 'youtube without ad'
        };
        console.log('Sending payload:', payload);

        const res = await axios.post('http://localhost:5000/api/products', payload);
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testCreateProduct();
