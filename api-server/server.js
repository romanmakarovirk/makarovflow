import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://makarovflow.vercel.app',
  'https://superlative-gelato-2ffbac.netlify.app',
  'http://localhost:5173', // Dev server
  'http://localhost:3000'  // Dev server
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Limit request body size

// Basic rate limiting middleware (simple in-memory implementation)
const rateLimitStore = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    // Check limit
    if (record.count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
};

// Cleanup old rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Apply rate limiting to all API routes
app.use('/api/', rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use('/api/auth/', rateLimit(15 * 60 * 1000, 10)); // Stricter limit for auth (10 per 15 min)

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Login/Register via Telegram
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, language_code } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID required' });
    }

    // Check if user exists
    let user = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegram_id]
    );

    if (user.rows.length === 0) {
      // Create new user
      user = await pool.query(
        `INSERT INTO users (telegram_id, username, first_name, last_name, language_code)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [telegram_id, username, first_name, last_name, language_code || 'ru']
      );

      // Create default settings
      await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1)',
        [user.rows[0].id]
      );
    } else {
      // Update user info
      user = await pool.query(
        `UPDATE users
         SET username = $2, first_name = $3, last_name = $4, language_code = $5
         WHERE telegram_id = $1
         RETURNING *`,
        [telegram_id, username, first_name, last_name, language_code || 'ru']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, telegramId: telegram_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: user.rows[0]
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ==================== USER ROUTES ====================

// Get current user
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== JOURNAL ROUTES ====================

// Get all journal entries
app.get('/api/journal', authenticateToken, async (req, res) => {
  try {
    const entries = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(entries.rows);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get journal entry by date
app.get('/api/journal/:date', authenticateToken, async (req, res) => {
  try {
    const entry = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(entry.rows[0] || null);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Create journal entry
app.post('/api/journal', authenticateToken, async (req, res) => {
  try {
    const { date, mood, mood_emoji, energy, sleep_hours, sleep_quality, workout_minutes, workout_calories, notes, tags } = req.body;

    const entry = await pool.query(
      `INSERT INTO journal_entries
       (user_id, date, mood, mood_emoji, energy, sleep_hours, sleep_quality, workout_minutes, workout_calories, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id, date)
       DO UPDATE SET mood = $3, mood_emoji = $4, energy = $5, sleep_hours = $6, sleep_quality = $7,
                     workout_minutes = $8, workout_calories = $9, notes = $10, tags = $11, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, date, mood, mood_emoji, energy, sleep_hours, sleep_quality, workout_minutes || 0, workout_calories || 0, notes, tags]
    );

    res.json(entry.rows[0]);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update journal entry
app.put('/api/journal/:id', authenticateToken, async (req, res) => {
  try {
    const { mood, mood_emoji, energy, sleep_hours, sleep_quality, workout_minutes, workout_calories, notes, tags } = req.body;

    const entry = await pool.query(
      `UPDATE journal_entries
       SET mood = $2, mood_emoji = $3, energy = $4, sleep_hours = $5, sleep_quality = $6,
           workout_minutes = $7, workout_calories = $8, notes = $9, tags = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $11
       RETURNING *`,
      [req.params.id, mood, mood_emoji, energy, sleep_hours, sleep_quality, workout_minutes, workout_calories, notes, tags, req.user.userId]
    );

    if (entry.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry.rows[0]);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete journal entry
app.delete('/api/journal/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ==================== TASKS ROUTES ====================

// Get all tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(tasks.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, notes, list, area, project, when_date, when_type, deadline, reminder, tags } = req.body;

    const task = await pool.query(
      `INSERT INTO tasks
       (user_id, title, notes, list, area, project, when_date, when_type, deadline, reminder, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user.userId, title, notes, list || 'inbox', area, project, when_date, when_type, deadline, reminder, tags]
    );

    res.json(task.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, notes, list, area, project, when_date, when_type, deadline, reminder, tags, completed } = req.body;

    const task = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($2, title), notes = $3, list = COALESCE($4, list),
           area = $5, project = $6, when_date = $7, when_type = $8,
           deadline = $9, reminder = $10, tags = $11, completed = COALESCE($12, completed),
           completed_at = CASE WHEN $12 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $13
       RETURNING *`,
      [req.params.id, title, notes, list, area, project, when_date, when_type, deadline, reminder, tags, completed, req.user.userId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ==================== HOMEWORK ROUTES ====================

// Get all homework
app.get('/api/homework', authenticateToken, async (req, res) => {
  try {
    const homework = await pool.query(
      'SELECT * FROM homework WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.userId]
    );
    res.json(homework.rows);
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ error: 'Failed to fetch homework' });
  }
});

// Create homework
app.post('/api/homework', authenticateToken, async (req, res) => {
  try {
    const { subject, description, due_date, priority } = req.body;

    const homework = await pool.query(
      `INSERT INTO homework (user_id, subject, description, due_date, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, subject, description, due_date, priority || 'medium']
    );

    res.json(homework.rows[0]);
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ error: 'Failed to create homework' });
  }
});

// Update homework
app.put('/api/homework/:id', authenticateToken, async (req, res) => {
  try {
    const { subject, description, due_date, priority, completed } = req.body;

    const homework = await pool.query(
      `UPDATE homework
       SET subject = COALESCE($2, subject), description = $3, due_date = COALESCE($4, due_date),
           priority = COALESCE($5, priority), completed = COALESCE($6, completed),
           completed_at = CASE WHEN $6 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $7
       RETURNING *`,
      [req.params.id, subject, description, due_date, priority, completed, req.user.userId]
    );

    if (homework.rows.length === 0) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    res.json(homework.rows[0]);
  } catch (error) {
    console.error('Error updating homework:', error);
    res.status(500).json({ error: 'Failed to update homework' });
  }
});

// Delete homework
app.delete('/api/homework/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM homework WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting homework:', error);
    res.status(500).json({ error: 'Failed to delete homework' });
  }
});

// ==================== PROMO CODES ====================

// Activate promo code
app.post('/api/promo/activate', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    // Get promo code
    const promoResult = await pool.query(
      'SELECT * FROM promo_codes WHERE code = $1 AND active = true',
      [code]
    );

    if (promoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    const promo = promoResult.rows[0];

    // Check if already used by this user
    const usageCheck = await pool.query(
      'SELECT * FROM promo_code_usage WHERE promo_code_id = $1 AND user_id = $2',
      [promo.id, req.user.userId]
    );

    if (usageCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Promo code already used' });
    }

    // Check usage limit
    if (promo.used_count >= promo.max_uses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    // Activate premium
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + promo.duration_days);

    await pool.query(
      'UPDATE users SET is_premium = true, premium_expires_at = $2 WHERE id = $1',
      [req.user.userId, expiresAt]
    );

    // Record usage
    await pool.query(
      'INSERT INTO promo_code_usage (promo_code_id, user_id) VALUES ($1, $2)',
      [promo.id, req.user.userId]
    );

    await pool.query(
      'UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1',
      [promo.id]
    );

    res.json({
      success: true,
      message: `Premium activated for ${promo.duration_days} days!`,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('Error activating promo code:', error);
    res.status(500).json({ error: 'Failed to activate promo code' });
  }
});

// ==================== SETTINGS ====================

// Get settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.userId]
    );

    if (settings.rows.length === 0) {
      // Create default settings
      const newSettings = await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [req.user.userId]
      );
      return res.json(newSettings.rows[0]);
    }

    res.json(settings.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { theme, notifications, ai_usage } = req.body;

    const settings = await pool.query(
      `UPDATE user_settings
       SET theme = COALESCE($2, theme), notifications = COALESCE($3, notifications),
           ai_usage = COALESCE($4, ai_usage), updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [req.user.userId, theme, notifications, ai_usage]
    );

    res.json(settings.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'MindFlow API',
    version: '1.0.0',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MindFlow API running on port ${PORT}`);
});
