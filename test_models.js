const { sequelize, connectDB } = require('./config/db');
const { User, UserPlatform } = require('./models');

async function testMergedModels() {
    try {
        await connectDB();
        console.log('--- Testing Merged Models (UserPlatform) ---');

        // 1. Create a User
        const email = `merge_test_${Date.now()}@example.com`;
        const user = await User.create({
            username: `merge_user_${Date.now()}`,
            email: email,
            password: 'password123'
        });
        console.log('1. User created:', user.id);

        // 2. Add a Google Identity
        await UserPlatform.create({
            user_id: user.id,
            platform_type: 'auth_provider',
            provider: 'google',
            provider_user_id: '1234567890',
            meta_data: { email: email, verified: true }
        });
        console.log('2. Google identity added via UserPlatform');

        // 3. Add an App Context
        await UserPlatform.create({
            user_id: user.id,
            platform_type: 'application',
            provider: 'internal_crm',
            app_slug: 'sales-dashboard',
            meta_data: { role: 'admin' }
        });
        console.log('3. App context added via UserPlatform');

        // 4. Verify Associations
        const userWithPlatforms = await User.findOne({
            where: { id: user.id },
            include: ['platforms']
        });

        if (userWithPlatforms.platforms.length === 2) {
            console.log('4. ✅ SUCCESS: User has 2 associated platforms.');
            userWithPlatforms.platforms.forEach(p => {
                console.log(`   - ${p.platform_type}: ${p.provider} (${p.app_slug || 'N/A'})`);
            });
        } else {
            console.error('4. ❌ FAILED: Association count mismatch.');
            process.exit(1);
        }

        console.log('--- All Tests Passed ---');
        process.exit(0);

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
}

testMergedModels();
