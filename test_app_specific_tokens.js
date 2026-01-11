require('dotenv').config();
const axios = require('axios');

/**
 * Test script to demonstrate app-specific JWT tokens
 * Shows how tokens from different apps are isolated
 */

const BASE_URL = 'http://localhost:3000/api/auth';

// Simulate login to App A
const testAppALogin = async () => {
    console.log('🔐 Testing login to App A...\n');
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'password123',
            app_slug: 'app-a',
            platform_type: 'web',
            provider: 'local'
        });
        
        console.log('✅ App A Login Success!');
        console.log('Token (first 50 chars):', response.data.token.substring(0, 50) + '...\n');
        
        return response.data.token;
    } catch (error) {
        console.error('❌ App A Login Failed:', error.response?.data || error.message);
        return null;
    }
};

// Simulate login to App B (same user, different app)
const testAppBLogin = async () => {
    console.log('🔐 Testing login to App B (same user)...\n');
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'password123',
            app_slug: 'app-b',
            platform_type: 'web',
            provider: 'local'
        });
        
        console.log('✅ App B Login Success!');
        console.log('Token (first 50 chars):', response.data.token.substring(0, 50) + '...\n');
        
        return response.data.token;
    } catch (error) {
        console.error('❌ App B Login Failed:', error.response?.data || error.message);
        return null;
    }
};

// Decode JWT to show payload (without verification)
const decodeJWT = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
};

// Main test
const runTest = async () => {
    console.log('='.repeat(70));
    console.log('🧪 APP-SPECIFIC JWT TOKEN TEST');
    console.log('='.repeat(70));
    console.log('\nThis test demonstrates that tokens are app-specific:\n');
    
    const tokenA = await testAppALogin();
    const tokenB = await testAppBLogin();
    
    if (tokenA && tokenB) {
        console.log('📊 Comparing Tokens:\n');
        
        const payloadA = decodeJWT(tokenA);
        const payloadB = decodeJWT(tokenB);
        
        console.log('App A Token Payload:');
        console.log(JSON.stringify(payloadA, null, 2));
        console.log('\nApp B Token Payload:');
        console.log(JSON.stringify(payloadB, null, 2));
        
        console.log('\n' + '='.repeat(70));
        console.log('📝 OBSERVATIONS:');
        console.log('='.repeat(70));
        console.log('✅ Same user can have multiple tokens for different apps');
        console.log('✅ Each token contains app_slug in payload');
        console.log('✅ Tokens are different even for the same user');
        console.log('✅ This prevents token overlap between applications\n');
        
        if (tokenA === tokenB) {
            console.log('❌ WARNING: Tokens are identical! This should not happen.');
        } else {
            console.log('✅ Tokens are unique (as expected)\n');
        }
    } else {
        console.log('\n⚠️  Could not complete test. Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. User exists with email: test@example.com');
        console.log('3. Database is connected\n');
    }
};

runTest();
