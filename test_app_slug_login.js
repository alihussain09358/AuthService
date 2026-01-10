const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

async function testAppSlugValidation() {
    try {
        console.log('--- Testing App Slug Validation on Login ---\n');

        // 1. Register user for 'mobile-app'
        const user1 = {
            username: 'mobileuser' + Date.now(),
            email: 'mobile' + Date.now() + '@example.com',
            password: 'password123',
            app_slug: 'mobile-app',
            platform_type: 'mobile'
        };

        console.log('1. Registering user for mobile-app...');
        await axios.post(`${API_URL}/auth/register`, user1);
        console.log('   ✅ User registered for mobile-app\n');

        // 2. Try to login with correct app_slug
        console.log('2. Login with CORRECT app_slug (mobile-app)...');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: user1.email,
                password: user1.password,
                app_slug: 'mobile-ap1',
                platform_type: 'mobile',
                provider: 'local'
            });
            if (loginRes.data.token) {
                console.log('   ✅ SUCCESS: Login allowed\n');
            }
        } catch (err) {
            console.error('   ❌ FAILED: Should have allowed login');
            console.error('   Error:', err.response?.data);
            process.exit(1);
        }

        // 3. Try to login with WRONG app_slug
        console.log('3. Login with WRONG app_slug (web-app)...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: user1.email,
                password: user1.password,
                app_slug: 'web-app',
                platform_type: 'web',
                provider: 'local'
            });
            console.error('   ❌ FAILED: Should have rejected login');
            process.exit(1);
        } catch (err) {
            if (err.response?.data?.message === 'User does not have access to this application') {
                console.log('   ✅ SUCCESS: Login correctly rejected');
                console.log('   Message:', err.response.data.message, '\n');
            } else {
                console.error('   ❌ Unexpected error:', err.response?.data);
                process.exit(1);
            }
        }

        // 4. Register same user for web-app
        console.log('4. Registering same user for web-app...');
        const { UserPlatform } = require('./models');
        const { User } = require('./models');
        const existingUser = await User.findOne({ where: { email: user1.email } });
        await UserPlatform.create({
            user_id: existingUser.id,
            platform_type: 'web',
            provider: 'local',
            provider_user_id: existingUser.id.toString(),
            app_slug: 'web-app'
        });
        console.log('   ✅ User now has access to web-app\n');

        // 5. Try to login with web-app now
        console.log('5. Login with web-app (now should work)...');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: user1.email,
                password: user1.password,
                app_slug: 'web-app',
                platform_type: 'web',
                provider: 'local'
            });
            if (loginRes.data.token) {
                console.log('   ✅ SUCCESS: Login allowed for web-app\n');
            }
        } catch (err) {
            console.error('   ❌ FAILED: Should have allowed login');
            console.error('   Error:', err.response?.data);
            process.exit(1);
        }

        console.log('--- All App Slug Validation Tests Passed! ---');

        // Cleanup
        await User.destroy({ where: { email: user1.email } });

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        if (err.response) {
            console.error('Response:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
}

setTimeout(testAppSlugValidation, 1000);
