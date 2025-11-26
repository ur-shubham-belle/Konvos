import db from './db';
import fs from 'fs';
import path from 'path';

// Try multiple paths for schema.sql
const possiblePaths = [
  path.join(process.cwd(), 'server/schema.sql'),
  path.join(__dirname, '../schema.sql'),
  './server/schema.sql',
  '../schema.sql'
];

let schemaPath = '';
for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      schemaPath = p;
      break;
    }
  } catch {}
}

if (!schemaPath) {
  console.warn('Warning: schema.sql not found at any expected location');
  process.exit(0);
}

try {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully.');
    }
  });
} catch (err) {
  console.error('Error reading schema.sql:', err);
}
