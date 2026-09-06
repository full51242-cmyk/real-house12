const { createClient } = require('@supabase/supabase-js');

async function requireAuth(req, res, next) {
  const authHeader = req.get('authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Authentication token is invalid or expired' });
    }

    req.user = data.user;
    req.supabase = supabase;
    return next();
  } catch (error) {
    console.error('Authentication verification failed:', error.message);
    return res.status(401).json({ message: 'Authentication could not be verified' });
  }
}

module.exports = { requireAuth };
