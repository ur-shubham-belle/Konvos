import { Request, Response } from 'express';
import { StreamChat } from 'stream-chat';
import bcrypt from 'bcryptjs';
import db from '../db';

const getStreamClient = () => {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.STREAM_API_SECRET;
  if (!key || !secret) {
    throw new Error('Stream credentials not configured');
  }
  return StreamChat.getInstance(key, secret);
};

export const register = async (req: Request, res: Response) => {
  const { id, name, password, image } = req.body;

  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [id], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(409).json({ error: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert into DB
    db.run(
      'INSERT INTO users (id, name, password_hash, image) VALUES (?, ?, ?, ?)',
      [id, name, hash, image || ''],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to create user' });

        try {
          // Create user in Stream
          const serverClient = getStreamClient();
          await serverClient.upsertUser({
            id,
            name,
            image,
          });

          // Generate Token
          const token = serverClient.createToken(id);

          return res.json({
            user: { id, name, image },
            token
          });
        } catch (error: any) {
          console.error('Stream Error:', error);
          return res.status(500).json({ error: 'Failed to create user in Stream', details: error.message });
        }
      }
    );
  });
};

export const login = async (req: Request, res: Response) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [id], async (err, row: any) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify password
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      // Generate Token
      const serverClient = getStreamClient();
      const token = serverClient.createToken(id);

      return res.json({
        user: { id: row.id, name: row.name, image: row.image },
        token
      });
    } catch (error: any) {
      console.error('Stream Error:', error);
      return res.status(500).json({ error: 'Failed to generate token', details: error.message });
    }
  });
};
