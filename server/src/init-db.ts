import db from './db';
import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, '../schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
  } else {
    console.log('Database initialized successfully.');
  }
});
