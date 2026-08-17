import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const DEMO_EMAIL = 'demo@sajilokhata.com';
const NEW_PASSWORD = 'Demo@2026';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:bw0E1SOfJgF7VauE@db.odgujlwefhczocqsywxl.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database');

  const res = await client.query('SELECT id, name, email, role FROM users WHERE email = $1', [DEMO_EMAIL]);

  if (res.rows.length === 0) {
    console.log(`User with email "${DEMO_EMAIL}" does NOT exist in the database.`);
    await client.end();
    return;
  }

  const user = res.rows[0];
  console.log(`User found: id=${user.id}, name="${user.name}", email="${user.email}", role="${user.role}"`);

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
  await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, DEMO_EMAIL]);

  console.log(`\nPassword reset successfully!`);
  console.log(`New credentials:`);
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${NEW_PASSWORD}`);

  await client.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
