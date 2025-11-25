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

  const normalizedId = id.toLowerCase().trim();

  db.get('SELECT * FROM users WHERE id = ?', [normalizedId], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(409).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    db.run(
      'INSERT INTO users (id, name, password_hash, image) VALUES (?, ?, ?, ?)',
      [normalizedId, name, hash, image || ''],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to create user' });

        try {
          const serverClient = getStreamClient();
          await serverClient.upsertUser({
            id: normalizedId,
            name,
            image,
          });

          const token = serverClient.createToken(normalizedId);

          return res.json({
            user: { id: normalizedId, name, image },
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

  const normalizedId = id.toLowerCase().trim();

  db.get('SELECT * FROM users WHERE id = ?', [normalizedId], async (err, row: any) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (!row) {
      try {
        const serverClient = getStreamClient();
        const response = await serverClient.queryUsers({ id: normalizedId });
        
        if (response.users && response.users.length > 0) {
          const streamUser = response.users[0];
          
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);
          
          return new Promise<void>((resolve) => {
            db.run(
              'INSERT INTO users (id, name, password_hash, image) VALUES (?, ?, ?, ?)',
              [normalizedId, streamUser.name || normalizedId, hash, streamUser.image || ''],
              function (insertErr) {
                if (insertErr) {
                  console.error('Failed to sync user from Stream:', insertErr);
                  res.status(401).json({ error: 'Invalid credentials' });
                  resolve();
                  return;
                }
                
                const token = serverClient.createToken(normalizedId);
                res.json({
                  user: { 
                    id: normalizedId, 
                    name: streamUser.name || normalizedId, 
                    image: streamUser.image || '' 
                  },
                  token
                });
                resolve();
              }
            );
          });
        }
      } catch (streamErr) {
        console.error('Stream query error:', streamErr);
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const serverClient = getStreamClient();
      
      await serverClient.upsertUser({
        id: row.id,
        name: row.name,
        image: row.image,
      });
      
      const token = serverClient.createToken(row.id);

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
