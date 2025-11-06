export const config = { runtime: 'nodejs' };

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { username, password } = body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return res.json({ success: true, token, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
}
