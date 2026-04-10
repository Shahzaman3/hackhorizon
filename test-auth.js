/**
 * Auth System Test Script
 * Tests registration, login, and current user endpoints
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User ' + Date.now(),
  email: `testuser${Date.now()}@example.com`,
  password: 'Test@12345',
  role: 'seller',
  gstin: '27AAPFU0939F1ZV'
};

console.log('🧪 Starting Auth System Tests\n');
console.log('📝 Test User:', testUser.email);
console.log('─'.repeat(60));

/**
 * Makes HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Run tests
 */
async function runTests() {
  try {
    // Test 1: Register new user
    console.log('\n1️⃣  TEST: Register new user');
    console.log('   Sending:', { name: testUser.name, email: testUser.email, role: testUser.role });
    
    const registerRes = await makeRequest('POST', '/auth/register', testUser);
    console.log('   Status:', registerRes.status);
    console.log('   Response:', JSON.stringify(registerRes.data, null, 2));

    if (!registerRes.data.success) {
      console.log('   ❌ FAILED: Registration failed');
      return;
    }

    const registeredUser = registerRes.data.data?.user;
    if (!registeredUser) {
      console.log('   ❌ FAILED: No user data in response');
      return;
    }

    console.log('   ✅ PASSED: User registered successfully');
    console.log('   User ID:', registeredUser.id);
    console.log('   Email:', registeredUser.email);

    // Test 2: Try registering same user again
    console.log('\n2️⃣  TEST: Try registering duplicate user (should fail)');
    const duplicateRes = await makeRequest('POST', '/auth/register', testUser);
    console.log('   Status:', duplicateRes.status);
    console.log('   Response:', JSON.stringify(duplicateRes.data, null, 2));

    if (duplicateRes.status === 400 && duplicateRes.data.message?.includes('already exists')) {
      console.log('   ✅ PASSED: Duplicate prevention working');
    } else {
      console.log('   ❌ FAILED: Duplicate prevention not working correctly');
    }

    // Test 3: Login with correct credentials
    console.log('\n3️⃣  TEST: Login with correct credentials');
    console.log('   Sending:', { email: testUser.email, password: testUser.password });

    const loginRes = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('   Status:', loginRes.status);
    console.log('   Response:', JSON.stringify(loginRes.data, null, 2));

    if (loginRes.data.success) {
      console.log('   ✅ PASSED: Login successful');
    } else {
      console.log('   ❌ FAILED: Login failed');
    }

    // Test 4: Login with wrong password
    console.log('\n4️⃣  TEST: Login with wrong password (should fail)');
    const wrongPassRes = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: 'WrongPassword123'
    });
    console.log('   Status:', wrongPassRes.status);
    console.log('   Response:', JSON.stringify(wrongPassRes.data, null, 2));

    if (wrongPassRes.status === 401) {
      console.log('   ✅ PASSED: Wrong password rejected');
    } else {
      console.log('   ❌ FAILED: Wrong password not properly handled');
    }

    // Test 5: Login with non-existent email
    console.log('\n5️⃣  TEST: Login with non-existent email (should fail)');
    const noUserRes = await makeRequest('POST', '/auth/login', {
      email: 'nonexistent@example.com',
      password: 'Test@12345'
    });
    console.log('   Status:', noUserRes.status);
    console.log('   Response:', JSON.stringify(noUserRes.data, null, 2));

    if (noUserRes.status === 401) {
      console.log('   ✅ PASSED: Non-existent user rejected');
    } else {
      console.log('   ❌ FAILED: Non-existent user not properly handled');
    }

    // Test 6: Test email case-insensitivity
    console.log('\n6️⃣  TEST: Email case-insensitivity');
    const caseInsensitiveEmail = testUser.email.toUpperCase();
    console.log('   Trying login with uppercase email:', caseInsensitiveEmail);

    const caseRes = await makeRequest('POST', '/auth/login', {
      email: caseInsensitiveEmail,
      password: testUser.password
    });
    console.log('   Status:', caseRes.status);
    console.log('   Response:', JSON.stringify(caseRes.data, null, 2));

    if (caseRes.data.success) {
      console.log('   ✅ PASSED: Case-insensitive email matching works');
    } else {
      console.log('   ❌ FAILED: Case-insensitive email matching not working');
    }

    console.log('\n' + '─'.repeat(60));
    console.log('✨ Tests completed!');

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.log('\n⚠️  Make sure the server is running on http://localhost:5000');
  }
}

// Run the tests
runTests();
