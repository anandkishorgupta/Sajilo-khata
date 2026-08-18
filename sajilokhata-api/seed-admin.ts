import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'admin@sajilokhata.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Super Admin';

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres:bw0E1SOfJgF7VauE@db.odgujlwefhczocqsywxl.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('Connected to database');

    // Check if admins table exists, create if not
    await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    // Check if admin already exists
    const existing = await client.query('SELECT id FROM admins WHERE email = $1', [ADMIN_EMAIL]);

    if (existing.rows.length > 0) {
        // Update password
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await client.query('UPDATE admins SET password = $1 WHERE email = $2', [hashedPassword, ADMIN_EMAIL]);
        console.log(`Admin "${ADMIN_EMAIL}" already exists. Password updated.`);
    } else {
        // Create new admin
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await client.query(
            'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
            [ADMIN_NAME, ADMIN_EMAIL, hashedPassword],
        );
        console.log(`Admin created successfully!`);
    }

    console.log(`\nAdmin credentials:`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);

    await client.end();
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
