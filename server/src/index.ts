import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login } from './handlers/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Konvos Backend is running!');
});

app.post('/api/register', register);
app.post('/api/login', login);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
