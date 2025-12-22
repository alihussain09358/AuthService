const { z } = require('zod');

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    app_slug: z.string().min(1, 'App slug is required'),
    platform_type: z.string().optional(),
    provider: z.string().optional(),
    provider_user_id: z.string().optional(),
    meta_data: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    app_slug: z.string().min(1, 'App slug is required'),
    platform_type: z.string().optional(),
    provider: z.string().optional(),
    provider_user_id: z.string().optional(),
    meta_data: z.string().optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
};
