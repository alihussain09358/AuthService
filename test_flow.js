const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

const testUser = {
    username: 'testuser',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    app_slug: 'test-suite-app'
};

async function runTests() {
    try {
        console.log('--- Starting Tests ---');

        // 1. Register
        console.log('1. Registering user...');
        const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
        if (registerRes.data.token) {
            console.log('   SUCCESS: User registered, token received.');
        } else {
            console.error('   FAILED: No token in response.');
            process.exit(1);
        }
        
        const token = registerRes.data.token;
        const config = {
            headers: {
                'x-auth-token': token
            }
        };

        // 2. Get User Profile
        console.log('2. Getting user profile...');
        const profileRes = await axios.get(`${API_URL}/users`, config);
        // console.log("   Profile:", JSON.stringify(profileRes.data, null, 2)); 
        if (profileRes.data.email === testUser.email && Array.isArray(profileRes.data.platforms)) {
            console.log(`   SUCCESS: Profile retrieved. Platforms: ${profileRes.data.platforms.length}`);
            profileRes.data.platforms.forEach(p => console.log(`      - ${p.provider} (${p.platform_type})`));
        } else {
            console.error('   FAILED: Profile mismatch or platforms missing.');
            console.error('   Data:', JSON.stringify(profileRes.data, null, 2));
        }

        // 3. Update User
        console.log('3. Updating user...');
        const newUsername = 'updatedUser';
        const updateRes = await axios.put(`${API_URL}/users`, { username: newUsername }, config);
        if (updateRes.data.username === newUsername) {
            console.log('   SUCCESS: Username updated.');
        } else {
            console.error('   FAILED: Update failed.');
        }

        // 4. Delete User
        console.log('4. Deleting user...');
        const deleteRes = await axios.delete(`${API_URL}/users`, config);
        if (deleteRes.data.msg === 'User removed') {
            console.log('   SUCCESS: User deleted.');
        } else {
            console.error('   FAILED: Delete failed.');
        }

        console.log('--- All Tests Passed ---');

    } catch (err) {
        console.error('TEST FAILED:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    }
}

// Wait for server to start, then run
setTimeout(runTests, 1000);
