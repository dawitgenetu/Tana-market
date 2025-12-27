import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API = process.env.TEST_API_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5001}/api`;

const log = (label, ok, details) => console.log(`${ok ? '✅' : '❌'} ${label}${details ? ' - ' + details : ''}`);

const pause = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Running smoke tests against', API);
  try {
    // 1. List products
    let res = await axios.get(`${API}/products`);
    log('GET /products', res.status === 200, `items:${Array.isArray(res.data?.data) ? res.data.data.length : 'N/A'}`);

    const products = (res.data && res.data.data) || res.data || [];
    const productId = products[0]?._id || products[0]?.id;

    // 2. Register customer
    const customer = { name: 'Smoke Tester', email: `smoke+${Date.now()}@test.local`, password: 'SmokePass1!' };
    res = await axios.post(`${API}/auth/register`, customer).catch(e => e.response || e);
    const registered = res?.status === 201 || res?.data?.token;
    log('POST /auth/register', registered, res?.status || res?.message);

    // 3. Login customer
    res = await axios.post(`${API}/auth/login`, { email: customer.email, password: customer.password }).catch(e => e.response || e);
    const token = res?.data?.token;
    log('POST /auth/login', !!token, res?.status || res?.message);
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    // 4. Add to cart
    if (productId && token) {
      res = await axios.post(`${API}/cart`, { productId, quantity: 1 }, auth).catch(e => e.response || e);
      log('POST /cart', res?.status === 200, res?.status || res?.message);
    } else {
      log('POST /cart', false, 'missing productId or token');
    }

    // 5. Create order
    if (token) {
      res = await axios.post(`${API}/orders`, { shippingAddress: { street: '1 Test St', city: 'Test', state: 'TS', zipCode: '0000', country: 'Testland' } }, auth).catch(e => e.response || e);
      const order = res?.data;
      log('POST /orders', res?.status === 201, res?.status || res?.message);

      if (order && order._id) {
        // Try initializing payment (may fail without keys)
        const pay = await axios.post(`${API}/orders/${order._id}/payment`, {}, auth).catch(e => e.response || e);
        log('POST /orders/:id/payment (init)', pay?.status === 200, pay?.status || pay?.message || JSON.stringify(pay?.data));
      }
    }

    // 6. Admin checks
    // Use seeded admin credentials from README/seed - alter if different
    const adminCreds = { email: process.env.ADMIN_EMAIL || 'admin@tana-market.test', password: process.env.ADMIN_PASSWORD || 'AdminPass123' };
    res = await axios.post(`${API}/auth/login`, adminCreds).catch(e => e.response || e);
    const adminToken = res?.data?.token;
    log('Admin login', !!adminToken, res?.status || res?.message);
    const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 7. Get reports
    if (adminToken) {
      res = await axios.get(`${API}/reports/sales`, adminAuth).catch(e => e.response || e);
      log('GET /reports/sales', res?.status === 200, res?.status || res?.message);
    }

    // 8. Create a product as manager (if manager exists in seeds)
    const managerCreds = { email: process.env.MANAGER_EMAIL || 'manager@tana-market.test', password: process.env.MANAGER_PASSWORD || 'ManagerPass123' };
    res = await axios.post(`${API}/auth/login`, managerCreds).catch(e => e.response || e);
    const managerToken = res?.data?.token;
    log('Manager login', !!managerToken, res?.status || res?.message);
    if (managerToken) {
      const mgrAuth = { headers: { Authorization: `Bearer ${managerToken}` } };
      res = await axios.post(`${API}/products`, { name: 'Manager Created Product', description: 'From smoke test', price: 99, category: 'Test', stock: 10 }, mgrAuth).catch(e => e.response || e);
      log('POST /products (manager)', res?.status === 201, res?.status || res?.message);
    }

    // 9. Comments
    if (productId && token) {
      res = await axios.post(`${API}/comments`, { product: productId, rating: 5, comment: 'Great product!' }, auth).catch(e => e.response || e);
      log('POST /comments', res?.status === 201 || res?.status === 200, res?.status || res?.message);
    }

    // 10. Tracking sample (will depend on orders)
    // Attempt to get tracking for a random made-up code
    res = await axios.get(`${API}/tracking/TANA-20250101-0001`).catch(e => e.response || e);
    log('GET /tracking/:code', res?.status === 200 || res?.status === 404, res?.status || res?.message);

    console.log('Smoke tests finished. Review above logs for failures.');
    process.exit(0);
  } catch (error) {
    console.error('Smoke test error:', error.message || error);
    process.exit(1);
  }
}

run();
