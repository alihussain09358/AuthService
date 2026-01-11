require('dotenv').config();
const axios = require('axios');

/**
 * Test script for Google Token-Based Authentication
 * 
 * NOTE: This is a mock test. In a real scenario, you would:
 * 1. Implement Google Sign-In on your frontend
 * 2. Get the actual ID token (credential) from Google
 * 3. Send it to this endpoint
 * 
 * For testing purposes, you can:
 * - Use a real Google credential from a frontend implementation
 * - Or create a test user manually in the database with UserPlatform access
 */

const BASE_URL = 'http://localhost:3000/api/auth';

// Mock test data - Replace with real Google credential for actual testing
const testGoogleAuth = async () => {
    console.log('🧪 Testing Google Token-Based Authentication\n');
    
    // This is a placeholder - you need a REAL Google ID token to test
    const mockCredential = 'REPLACE_WITH_REAL_GOOGLE_ID_TOKEN';
    
    try {
        console.log('📤 Sending POST request to /api/auth/google');
        console.log('Request body:', {
            credential: mockCredential.substring(0, 20) + '...',
            app_slug: 'test-app',
            platform_type: 'web',
            provider: 'google'
        });
        
        const response = await axios.post(`${BASE_URL}/google`, {
            credential: mockCredential,
            app_slug: 'test-app',
            platform_type: 'web',
            provider: 'google'
        });
        
        console.log('\n✅ Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Test token validation
        if (response.data.token) {
            console.log('\n🔐 Testing token validation...');
            const validateResponse = await axios.get(`${BASE_URL}/validate`, {
                headers: {
                    'x-auth-token': response.data.token
                }
            });
            console.log('✅ Token is valid!');
            console.log('User data:', JSON.stringify(validateResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 This is expected if you\'re using a mock credential.');
            console.log('To properly test:');
            console.log('1. Implement Google Sign-In on your frontend');
            console.log('2. Get a real ID token from Google');
            console.log('3. Replace mockCredential with the real token');
        } else if (error.response?.status === 403) {
            console.log('\n💡 User authenticated but doesn\'t have access to this app_slug');
            console.log('Create a UserPlatform entry for this user with the specified app_slug');
        }
    }
};

// Test without app_slug (should still work but won't check access)
const testGoogleAuthNoAppSlug = async () => {
    console.log('\n\n🧪 Testing Google Auth WITHOUT app_slug verification\n');
    
    const mockCredential = 'REPLACE_WITH_REAL_GOOGLE_ID_TOKEN';
    
    try {
        const response = await axios.post(`${BASE_URL}/google`, {
            credential: mockCredential,
        });
        
        console.log('✅ Success without app_slug!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

// Instructions for manual testing
const printInstructions = () => {
    console.log('\n' + '='.repeat(70));
    console.log('📋 MANUAL TESTING INSTRUCTIONS');
    console.log('='.repeat(70));
    console.log('\nTo test with a real Google credential:');
    console.log('\n1. Create a simple HTML file with Google Sign-In:');
    console.log(`
<!DOCTYPE html>
<html>
<head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <div id="g_id_onload"
         data-client_id="YOUR_GOOGLE_CLIENT_ID"
         data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin" data-type="standard"></div>
    
    <script>
        function handleCredentialResponse(response) {
            console.log("Encoded JWT ID token: " + response.credential);
            // Copy this credential and use it in the test script
            
            // Or send directly to your API:
            fetch('http://localhost:3000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: response.credential,
                    app_slug: 'test-app',
                    platform_type: 'web'
                })
            })
            .then(res => res.json())
            .then(data => console.log('Success:', data))
            .catch(err => console.error('Error:', err));
        }
    </script>
</body>
</html>
    `);
    console.log('\n2. Open the HTML file in a browser');
    console.log('3. Sign in with Google');
    console.log('4. Copy the credential from console');
    console.log('5. Replace mockCredential in this test file');
    console.log('6. Run: node test_google_auth.js\n');
    console.log('='.repeat(70) + '\n');
};

// Run tests
const runTests = async () => {
    printInstructions();
    
    console.log('⚠️  Running with mock credentials (will fail)...\n');
    await testGoogleAuth();
    // await testGoogleAuthNoAppSlug();
};

runTests();
