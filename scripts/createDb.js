const { Client } = require('pg');
require('dotenv').config();

const createDb = async () => {
    // Parse connection string or use defaults. 
    // We connect to 'postgres' default DB to create the new one.
    // Assuming DATABASE_URL format: postgres://user:pass@host:port/dbname
    const dbName = 'authservice';
    
    // Construct connection string for default 'postgres' db
    // We'll strip the DB name from the env var if present, or just hardcode for verified local setup
    // Based on user: postgres://postgres:admin@localhost:5432/authservice
    
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/authservice';
    
    // Replace authservice with postgres to connect to default DB
    const rootConnectionString = connectionString.replace(`/${dbName}`, '/postgres');

    const client = new Client({
        connectionString: rootConnectionString,
    });

    try {
        await client.connect();
        console.log('Connected to default postgres database...');

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`Database ${dbName} not found. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
};

createDb();
