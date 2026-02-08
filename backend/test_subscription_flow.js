const axios = require('axios');

async function testSubscriptionFlow() {
    try {
        console.log('Testing Subscription Creation from Cart...');

        const testName = 'Dynamic User Test ' + Date.now();
        const payload = {
            customer_name: testName,
            billing_cycle: 'Yearly',
            start_date: new Date().toISOString().split('T')[0],
            items: [
                {
                    id: 1,
                    price: 100,
                    variantId: null
                }
            ]
        };

        console.log('Sending payload:', payload);

        const res = await axios.post('http://localhost:5000/api/subscriptions/from-cart', payload);

        console.log('Response status:', res.status);
        console.log('Response data:', res.data);

        if (res.data.success && res.data.count > 0) {
            const sub = res.data.subscriptions[0];
            let success = true;

            if (sub.billing_cycle !== 'Yearly') {
                console.error(`❌ FAILURE: Expected Yearly, got ${sub.billing_cycle}`);
                success = false;
            }

            if (sub.customer_name !== testName) {
                console.error(`❌ FAILURE: Expected customer_name '${testName}', got '${sub.customer_name}'`);
                success = false;
            }

            if (success) {
                console.log('✅ SUCCESS: Subscription created with correct billing cycle and customer name');
            }
        } else {
            console.error('❌ FAILURE: No subscriptions created');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testSubscriptionFlow();
