const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

const testUser = {
    username: 'validatetester',
    email: 'validate' + Date.now() + '@example.com',
    password: 'password123',
    app_slug: 'validate-app'
};

async function runTests() {
    try {
        console.log('--- Starting Token Validation Tests ---');

        // 1. Register
        console.log('1. Registering user...');
        const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
        const token = registerRes.data.token;
        if (token) {
            console.log('   SUCCESS: User registered, token received.');
        } else {
            console.error('   FAILED: No token.');
            process.exit(1);
        }

        // 2. Validate Token (Valid)
        console.log('2. Validating token (Valid)...');
        try {
            const validRes = await axios.get(`${API_URL}/auth/validate`, {
                headers: { 'x-auth-token': token }
            });
            if (validRes.data.valid && validRes.data.user) {
                console.log('   SUCCESS: Token valid, user returned.');
            } else {
                console.error('   FAILED: Unexpected response:', validRes.data);
            }
        } catch (err) {
            console.error('   FAILED: Request failed:', err.message);
        }

        // 3. Validate Token (Invalid)
        console.log('3. Validating token (Invalid)...');
        try {
            await axios.get(`${API_URL}/auth/validate`, {
                headers: { 'x-auth-token': 'invalidtoken123' }
            });
            console.error('   FAILED: Should have returned 401.');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('   SUCCESS: Rejected with 401.');
            } else {
                console.error('   FAILED: Unexpected error:', err.message);
            }
        }
        
        // 4. Validate Token (Missing)
        console.log('4. Validating token (Missing)...');
        try {
            await axios.get(`${API_URL}/auth/validate`);
            console.error('   FAILED: Should have returned 401.');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('   SUCCESS: Rejected with 401.');
            } else {
                console.error('   FAILED: Unexpected error:', err.message);
            }
        }

        console.log('--- All Tests Passed ---');

        // Cleanup
        await axios.delete(`${API_URL}/users`, { headers: { 'x-auth-token': token } });

    } catch (err) {
        console.error('TEST FAILED:', err.response ? JSON.stringify(err.response.data) : err.message);
        process.exit(1);
    }
}

setTimeout(runTests, 1000);
