import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { PUBLIC_PAGES, PRIVATE_PAGES, LEGACY_REDIRECTS, matchProjectPath, buildSeoBlock, injectSeoBlock, buildSitemapXml, truncate, absoluteImageUrl } from './seo-meta.js';

// Load environment variables immediately
dotenv.config();

// Stripe Client Getter with descriptive environment check
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_51MockStripeKeyPlaceholder' || key.includes('Placeholder')) {
    throw new Error('A chave secreta do Stripe (STRIPE_SECRET_KEY) não foi encontrada nas variáveis de ambiente. Se você já cadastrou a chave, lembre-se de REINICIAR o aplicativo Node.js no painel da Hostinger para que as novas configurações entrem em vigor.');
  }
  return new Stripe(key);
}

// --- NATIVE CRYPTOGRAPHY AUTH SECURITY SYSTEM ---

// Hash password with native scryptSync
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const hash = derivedKey.toString('hex');
  return { hash, salt };
}

// Verify password
function verifyPassword(password, hash, salt) {
  const derivedKey = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derivedKey.length && crypto.timingSafeEqual(derivedKey, expected);
}

// Token signing key
const JWT_SECRET = process.env.JWT_SECRET || 'bridges_builders_super_secret_key_2026';

// Generate HMAC signed session token
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ 
    ...payload, 
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours exp
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

// Verify HMAC signed token
function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const computedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== computedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    
    return payload;
  } catch (err) {
    return null;
  }
}

// --- ACCOUNT SECURITY HELPERS (password policy, rate limiting, transactional email) ---

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128; // bounds the cost of scrypt on hostile input
const RESET_LINK_TTL_MINUTES = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateNewPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must have at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must have at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Minimal in-memory rate limiter (per process). Good enough to blunt brute force on the
// account endpoints; resets on restart.
const rateBuckets = new Map();
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) if (now > bucket.reset) rateBuckets.delete(key);
}, 10 * 60 * 1000).unref();

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

// Password-reset links must ONLY be built from the configured APP_URL. Deriving the host from the
// request (Origin / Host headers) would let an attacker make the victim receive a reset link that
// points at a domain the attacker controls.
function getAppUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let mailTransport = null;
function getMailTransport() {
  if (mailTransport) return mailTransport;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  const port = Number(SMTP_PORT) || 587;
  mailTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
  return mailTransport;
}

// Returns true when the message was handed to the SMTP server. Never throws.
async function sendMail({ to, subject, text, html }) {
  const transport = getMailTransport();
  if (!transport) {
    console.warn('[MAIL] SMTP is not configured (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM). Email NOT sent.');
    console.warn(`[MAIL] To: ${to} | Subject: ${subject}\n${text}`);
    return false;
  }
  try {
    await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
    return true;
  } catch (err) {
    console.error(`[MAIL] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

function mailLayout(heading, bodyHtml) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="color:#0a3161;margin:0 0 16px">${escapeHtml(heading)}</h2>
    ${bodyHtml}
    <p style="color:#94a3b8;font-size:12px;margin-top:32px">Building Bridges Foundation BR-USA</p>
  </div>`;
}

// Tells the account owner (primary + recovery address) that something changed in their security settings.
function notifyAccountChange(user, subject, message, extraRecipients = []) {
  const recipients = [...new Set([user.email, user.recovery_email, ...extraRecipients].filter(Boolean))];
  const text = `${message}\n\nSe não foi você, redefina sua senha imediatamente em ${getAppUrl()}/forgot-password e avise a administração.`;
  const html = mailLayout(subject, `<p>${escapeHtml(message)}</p><p>Se não foi você, <a href="${getAppUrl()}/forgot-password">redefina sua senha imediatamente</a> e avise a administração.</p>`);
  recipients.forEach((to) => { void sendMail({ to, subject, text, html }); });
}

async function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const payload = verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  const [rows] = await pool.query('SELECT * FROM `users` WHERE `id` = ?', [payload.id]);
  return rows[0] || null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Express middlewares
app.use(cors());

// Stripe Webhook Endpoint - Parses raw request body for secure signature verification
app.post('/api/checkout/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET is not configured.');
    return res.status(500).json({ error: 'Webhook secret is not configured on the server.' });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`[WEBHOOK SIGNATURE ERROR] ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`[WEBHOOK RECEIVED] processing session: ${session.id}`);

    try {
      const verifiedAmount = session.amount_total / 100;
      const currency = session.currency.toUpperCase();
      const supporterName = session.metadata?.supporter_name || 'Apoiador';
      const supporterEmail = session.metadata?.supporter_email || session.customer_details?.email || 'email@example.com';
      const supporterPhone = session.metadata?.supporter_phone || session.customer_details?.phone || '';
      const notes = session.metadata?.additional_notes || '';
      const initiativeId = session.metadata?.initiative_id || null;
      const projectId = session.metadata?.project_id || null;
      const transactionRef = session.id;

      await saveVerifiedContribution({
        gateway: 'stripe',
        verifiedAmount,
        currency,
        supporterName,
        supporterEmail,
        supporterPhone,
        notes,
        initiativeId,
        projectId,
        transactionRef
      });

      console.log(`[WEBHOOK SUCCESS] Contribution successfully verified and saved for session: ${session.id}`);
    } catch (err) {
      console.error(`[WEBHOOK DATABASE ERROR] failed to save contribution:`, err.message);
      // Return 500 so Stripe retries if it was a database transient error
      return res.status(500).json({ error: 'Database processing failed' });
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Disable aggressive caching for APIs (prevents Hostinger LiteSpeed/Nginx caching)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Database connection health check middleware
app.use('/api', (req, res, next) => {
  if (!pool) {
    return res.status(500).json({
      error: 'Conexão com o banco de dados MySQL falhou. (Database connection failed).',
      details: dbError || 'Pool not initialized. Make sure initializeDatabase() was called.',
      tip: 'Verifique se o seu servidor MySQL está rodando e se os dados de host, usuário, senha e nome do banco no arquivo .env de produção estão 100% corretos.'
    });
  }
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Configure MySQL Database Connection Pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'building_bridges',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
let dbError = null;
let isInitializing = false;

// Helper to generate URL-safe slugs
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Initialize database connection and setup tables/seed data automatically
async function initializeDatabase() {
  if (pool) return;
  if (isInitializing) return;
  isInitializing = true;
  try {
    // Directly establish connection pool with the specific database (extremely fast and avoids hanging on invalid host connections)
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MySQL connection pool successfully.');

    // Verify connection immediately to catch credentials or network errors in production
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('Database connection verified successfully.');
      dbError = null;
    } catch (connectionError) {
      console.error('Failed to connect to MySQL database:', connectionError.message);
      dbError = connectionError.message;
      pool = null; // Reset pool so the health check middleware intercepts failures
      isInitializing = false;
      return;
    }

    // Create the 'projects' table if it does not exist (image_url changed to LONGTEXT for Base64 support)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`goal_amount\` DECIMAL(15, 2) NOT NULL,
        \`raised_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`image_url\` LONGTEXT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'active',
        \`category\` VARCHAR(100) NULL,
        \`long_description\` TEXT NULL,
        \`budget_json\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_status (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create the 'initiatives' table if it does not exist (image_url changed to LONGTEXT for Base64 support)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`initiatives\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`project_id\` VARCHAR(255) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`suggested_price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`impact_description\` VARCHAR(255) NOT NULL,
        \`image_url\` LONGTEXT NULL,
        \`goal_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`raised_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'active',
        \`created_by_user\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_initiative_status (\`status\`),
        FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create the 'users' table if it does not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`display_name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`password_salt\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'staff',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_email (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Recovery e-mail column (added after the first release, so migrate existing databases)
    try {
      const [recoveryCols] = await pool.query('SHOW COLUMNS FROM `users` LIKE "recovery_email"');
      if (recoveryCols.length === 0) {
        await pool.query('ALTER TABLE `users` ADD COLUMN `recovery_email` VARCHAR(255) NULL AFTER `email`');
        console.log('users table altered: recovery_email column added.');
      }
    } catch (err) {
      console.error('Failed to add users.recovery_email column:', err.message);
    }

    // One-time password reset links (only the SHA-256 of the token is stored)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`password_resets\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`user_id\` VARCHAR(255) NOT NULL,
        \`token_hash\` CHAR(64) NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`used_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_token_hash (\`token_hash\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create the 'contributions' table if it does not exist (updated for project_id support)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`contributions\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`initiative_id\` VARCHAR(255) NULL,
        \`project_id\` VARCHAR(255) NULL,
        \`pledge_amount\` DECIMAL(10, 2) NOT NULL,
        \`currency\` VARCHAR(10) NOT NULL DEFAULT 'BRL',
        \`supporter_name\` VARCHAR(255) NOT NULL,
        \`supporter_email\` VARCHAR(255) NOT NULL,
        \`supporter_phone\` VARCHAR(255) NOT NULL,
        \`gateway\` VARCHAR(50) NOT NULL,
        \`transaction_reference\` VARCHAR(255) NOT NULL UNIQUE,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`additional_notes\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_transaction_ref (\`transaction_reference\`),
        FOREIGN KEY (\`initiative_id\`) REFERENCES \`initiatives\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Verify and alter 'contributions' table if it already existed but lacks project_id
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM `contributions` LIKE "project_id"');
      if (columns.length === 0) {
        console.log('Altering contributions table to support direct project contributions...');
        
        // Disable foreign key checks temporarily to make alterations safe
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Modify initiative_id to be nullable
        await pool.query('ALTER TABLE `contributions` MODIFY `initiative_id` VARCHAR(255) NULL');
        
        // Add project_id column
        await pool.query('ALTER TABLE `contributions` ADD COLUMN `project_id` VARCHAR(255) NULL AFTER `initiative_id`');
        
        // Add foreign key constraint for project_id
        await pool.query('ALTER TABLE `contributions` ADD CONSTRAINT fk_contributions_project FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE');
        
        // Re-enable foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('contributions table altered successfully.');
      }
    } catch (err) {
      console.error('Failed to dynamically alter contributions table:', err.message);
      // Ensure foreign key checks are re-enabled in case of failure
      try { await pool.query('SET FOREIGN_KEY_CHECKS = 1'); } catch (_) {}
    }
    
    console.log('Database tables verified.');

    // Verify and alter projects & initiatives tables to support LONGTEXT for image_url (for Base64 support on Hostinger)
    try {
      console.log('Verifying column types for Base64 image support...');
      // 1. Projects table
      const [projColumns] = await pool.query('SHOW COLUMNS FROM `projects` LIKE "image_url"');
      if (projColumns.length > 0 && projColumns[0].Type.toLowerCase() !== 'longtext') {
        console.log('Altering projects table to support LONGTEXT image_url...');
        await pool.query('ALTER TABLE `projects` MODIFY `image_url` LONGTEXT NULL');
        console.log('projects table altered successfully.');
      }
      
      // 2. Initiatives table
      const [initColumns] = await pool.query('SHOW COLUMNS FROM `initiatives` LIKE "image_url"');
      if (initColumns.length > 0 && initColumns[0].Type.toLowerCase() !== 'longtext') {
        console.log('Altering initiatives table to support LONGTEXT image_url...');
        await pool.query('ALTER TABLE `initiatives` MODIFY `image_url` LONGTEXT NULL');
        console.log('initiatives table altered successfully.');
      }
    } catch (err) {
      console.error('Failed to dynamically modify image_url columns:', err.message);
    }

    // Seed default projects if the database is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM `projects`');
    if (rows[0].count === 0) {
      console.log('Seeding default projects...');
      
      const seedProjects = [
        [
          'rio-grande', 
          'Rio Grande do Sul Relief', 
          'Support the long-term rebuilding efforts of local community centers, schools, and homes affected by historical floods in Southern Brazil.', 
          500000.00, 
          375000.00, 
          'https://picsum.photos/seed/rio/800/600', 
          'active', 
          'BRAZIL RELIEF', 
          'The historic floods in Rio Grande do Sul have displaced hundreds of thousands of families and destroyed vital community infrastructure. Our response focus is long-term sustainable recovery: rebuilding neighborhood community centers to serve as emergency shelters, constructing climate-resilient houses in safe elevations, and restoring community gardens to ensure local food sovereignty.', 
          JSON.stringify([
            { label: "Reconstruction", percent: 65 },
            { label: "Community Center Rebuilding", percent: 20 },
            { label: "Emergency Supplies", percent: 10 },
            { label: "Logistics", percent: 5 }
          ])
        ],
        [
          'gulf-coast', 
          'Gulf Coast Resilience', 
          'Equip regional coastal community hubs with resilient emergency solar infrastructure and clean water backup generators.', 
          750000.00, 
          315000.00, 
          'https://picsum.photos/seed/gulf/800/600', 
          'active', 
          'USA RESILIENCE', 
          'Coastal towns along the Gulf Coast are increasingly vulnerable to high-intensity hurricanes and subsequent power outages. This resilience initiative aims to fully solar-equip and secure 12 vital community shelters with off-grid battery arrays, backup clean water reverse-osmosis filtration systems, and localized satellite emergency communication nodes.', 
          JSON.stringify([
            { label: "Solar Infrastructure", percent: 55 },
            { label: "Water Purification", percent: 25 },
            { label: "Emergency Telecom", percent: 12 },
            { label: "Hub Preparation", percent: 8 }
          ])
        ],
        [
          'amazon-basin', 
          'Amazon Basin Canopy Restoration', 
          'Finance native seed collection, tree planting nurseries, and traditional agricultural training with 45 indigenous communities in Brazil.', 
          300000.00, 
          273000.00, 
          'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop', 
          'active', 
          'AMAZON RELIEF', 
          'In the heart of the Xingu Basin, traditional ways of life are under threat from both climate change and rapid deforestation. Our mission is two-fold: restoring 500 hectares of native canopy and providing climate-resilient, sustainable housing for 45 indigenous families.', 
          JSON.stringify([
            { label: "Construction", percent: 60 },
            { label: "Reforestation", percent: 25 },
            { label: "Training", percent: 10 },
            { label: "Logistics", percent: 5 }
          ])
        ]
      ];

      for (const project of seedProjects) {
        await pool.query(
          'INSERT INTO `projects` (`id`, `name`, `description`, `goal_amount`, `raised_amount`, `image_url`, `status`, `category`, `long_description`, `budget_json`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          project
        );
      }
      console.log('Seed projects data inserted successfully.');
    }

    // Seed default initiatives if the database is empty
    const [initRows] = await pool.query('SELECT COUNT(*) as count FROM `initiatives`');
    if (initRows[0].count === 0) {
      console.log('Seeding default solidarity initiatives...');
      const seedInitiatives = [
        [
          'camiseta-oficial',
          'rio-grande',
          'Camiseta Oficial Bridges Builders',
          'item',
          'Feita com algodão 100% orgânico sustentável. Ao vestir esta camiseta, você se torna um embaixador oficial da causa e espalha a mensagem de reconstrução de pontes e vidas.',
          80.00,
          'Garante 5 dias de alimentação e água limpa para uma família no campo',
          'https://picsum.photos/seed/tshirt/800/600',
          5000.00,
          1200.00,
          'active',
          'system_seed'
        ],
        [
          'churrasco-solidario',
          'rio-grande',
          'Churrasco Solidário dos Voluntários',
          'experience',
          'Junte-se à nossa grande confraternização solidária. Um dia de churrasco, risadas e comunhão preparado inteiramente por voluntários dedicados à nossa causa. Toda a arrecadação vai para a reconstrução de moradias.',
          40.00,
          'Financia a compra de 2 tijolos ecológicos para a reconstrução',
          'https://picsum.photos/seed/bbq/800/600',
          3000.00,
          1400.00,
          'active',
          'system_seed'
        ],
        [
          'bone-construtores',
          'gulf-coast',
          'Boné Oficial Construtores de Pontes',
          'item',
          'Boné premium com bordado exclusivo. Ideal para proteger do sol nos dias de ações esportivas ou no dia a dia. Vista o selo de apoio à resiliência das comunidades.',
          50.00,
          'Financia 1 lâmpada solar portátil de emergência para famílias isoladas',
          'https://picsum.photos/seed/cap/800/600',
          2500.00,
          950.00,
          'active',
          'system_seed'
        ],
        [
          'corrida-comunitaria',
          'gulf-coast',
          'Corrida de Rua Beneficente 5K',
          'experience',
          'Uma atividade esportiva aberta para todas as idades. Vamos correr, caminhar e nos exercitar juntos por um bem maior. O valor da inscrição apoia o centro comunitário solar da Costa do Golfo.',
          60.00,
          'Financia kit de primeiros socorros completo para o centro de resiliência',
          'https://picsum.photos/seed/run/800/600',
          4000.00,
          2100.00,
          'active',
          'system_seed'
        ]
      ];

      for (const initiative of seedInitiatives) {
        await pool.query(
          'INSERT INTO `initiatives` (`id`, `project_id`, `title`, `type`, `description`, `suggested_price`, `impact_description`, `image_url`, `goal_amount`, `raised_amount`, `status`, \`created_by_user\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          initiative
        );
      }
      console.log('Solidarity initiatives seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    dbError = error.message;
    pool = null;
  } finally {
    isInitializing = false;
  }
}

// Initialize database connection immediately in the background upon loading the file
initializeDatabase();

// --- DATABASE TRANSACTION HELPER FOR WEBHOOKS & MANUAL REDIRECTS ---

/**
 * Saves a verified contribution and increments raised amounts safely within a transaction.
 * @param {Object} details 
 * @returns {Promise<Object>} Object containing status, contribution details, and initiativeTitle
 */
async function saveVerifiedContribution({
  gateway,
  verifiedAmount,
  currency,
  supporterName,
  supporterEmail,
  supporterPhone,
  notes,
  initiativeId,
  projectId,
  transactionRef
}) {
  let dbConnection;
  try {
    dbConnection = await pool.getConnection();
    await dbConnection.beginTransaction();

    // Check if transaction has already been registered
    const [existing] = await dbConnection.query('SELECT id FROM `contributions` WHERE `transaction_reference` = ?', [transactionRef]);
    
    if (existing.length > 0) {
      console.log(`[VERIFY HELPER] Transaction already registered: ${transactionRef}`);
      await dbConnection.rollback();
      
      // Fetch the registered contribution
      const [contributionRows] = await pool.query('SELECT * FROM `contributions` WHERE `transaction_reference` = ?', [transactionRef]);
      
      let title = 'Projeto Urgente';
      if (initiativeId) {
        const [initiativeRows] = await pool.query('SELECT title FROM `initiatives` WHERE `id` = ?', [initiativeId]);
        title = initiativeRows[0]?.title || 'Ação Solidária';
      } else if (projectId) {
        const [projectRows] = await pool.query('SELECT name FROM `projects` WHERE `id` = ?', [projectId]);
        title = projectRows[0]?.name || 'Projeto Urgente';
      }
      
      return {
        alreadyProcessed: true,
        contribution: contributionRows[0],
        initiativeTitle: title
      };
    }

    const contributionId = `pledge-${Math.random().toString(36).substring(2, 11)}`;
    const contributionData = {
      id: contributionId,
      initiative_id: initiativeId || null,
      project_id: projectId || null,
      pledge_amount: verifiedAmount,
      currency: currency,
      supporter_name: supporterName,
      supporter_email: supporterEmail,
      supporter_phone: supporterPhone,
      gateway: gateway,
      transaction_reference: transactionRef,
      status: 'completed',
      additional_notes: notes || null
    };

    // Insert contribution
    await dbConnection.query('INSERT INTO `contributions` SET ?', contributionData);
    
    // Increment raised_amount of the specific initiative or project
    if (initiativeId) {
      await dbConnection.query(
        'UPDATE `initiatives` SET `raised_amount` = `raised_amount` + ? WHERE `id` = ?',
        [verifiedAmount, initiativeId]
      );
      
      // Also update the parent project's raised_amount
      const [initRows] = await dbConnection.query('SELECT project_id FROM `initiatives` WHERE `id` = ?', [initiativeId]);
      if (initRows.length > 0 && initRows[0].project_id) {
        await dbConnection.query(
          'UPDATE `projects` SET `raised_amount` = `raised_amount` + ? WHERE `id` = ?',
          [verifiedAmount, initRows[0].project_id]
        );
      }
    } else if (projectId) {
      await dbConnection.query(
        'UPDATE `projects` SET `raised_amount` = `raised_amount` + ? WHERE `id` = ?',
        [verifiedAmount, projectId]
      );
    }

    await dbConnection.commit();
    console.log(`[VERIFY HELPER SUCCESS] Contribution successfully registered: ${contributionId}`);

    let title = 'Projeto Urgente';
    if (initiativeId) {
      const [initiativeRows] = await pool.query('SELECT title FROM `initiatives` WHERE `id` = ?', [initiativeId]);
      title = initiativeRows[0]?.title || 'Ação Solidária';
    } else if (projectId) {
      const [projectRows] = await pool.query('SELECT name FROM `projects` WHERE `id` = ?', [projectId]);
      title = projectRows[0]?.name || 'Projeto Urgente';
    }

    return {
      alreadyProcessed: false,
      contribution: contributionData,
      initiativeTitle: title
    };
  } catch (err) {
    if (dbConnection) await dbConnection.rollback();
    throw err;
  } finally {
    if (dbConnection) dbConnection.release();
  }
}

// REST API Endpoints

// GET /api/projects - Retrieve list of all projects
app.get('/api/projects', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await pool.query('SELECT * FROM `projects` ORDER BY `created_at` DESC LIMIT ?', [limit]);
    
    // Parse JSON columns properly
    const projects = rows.map(project => {
      if (project.budget_json) {
        if (typeof project.budget_json === 'string') {
          try {
            project.budget_json = JSON.parse(project.budget_json);
          } catch (e) {
            console.error('Failed to parse budget_json for project', project.id);
          }
        }
      }
      return project;
    });

    res.json(projects);
  } catch (err) {
    console.error('API Error /api/projects:', err);
    res.status(500).json({ error: 'Database error fetching projects' });
  }
});

// GET /api/projects/:id - Retrieve details of a single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `projects` WHERE `id` = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = rows[0];
    if (project.budget_json && typeof project.budget_json === 'string') {
      try {
        project.budget_json = JSON.parse(project.budget_json);
      } catch (e) {
        // Fallback
      }
    }

    res.json(project);
  } catch (err) {
    console.error('API Error /api/projects/:id:', err);
    res.status(500).json({ error: 'Database error fetching project' });
  }
});

// POST /api/projects - Insert a new project (Admin only conceptually, secured locally)
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, goal_amount, image_url, status, category, long_description, budget_json } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is a required field.' });
    }

    // Generate a unique URL slug id from the project name
    const rawId = slugify(name);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const id = `${rawId}-${uniqueSuffix}`;

    const projectData = {
      id,
      name,
      description: description || null,
      goal_amount: parseFloat(goal_amount) || 0.00,
      raised_amount: 0.00,
      image_url: image_url || null,
      status: status || 'active',
      category: category || null,
      long_description: long_description || null,
      budget_json: budget_json ? JSON.stringify(budget_json) : null
    };

    await pool.query(
      'INSERT INTO `projects` SET ?',
      projectData
    );

    console.log(`New project created successfully: ${id}`);
    res.status(201).json({ success: true, project: { ...projectData, budget_json } });
  } catch (err) {
    console.error('API Error POST /api/projects:', err);
    res.status(500).json({ error: 'Database error creating project' });
  }
});

// PUT /api/projects/:id - Update an existing project (Admin only)
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, description, goal_amount, image_url, status, category, long_description, budget_json } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is a required field.' });
    }

    const projectData = {
      name,
      description: description || null,
      image_url: image_url || null,
      status: status || 'active',
      category: category || null,
      long_description: long_description || null,
      budget_json: budget_json ? JSON.stringify(budget_json) : null
    };
    // The goal is no longer edited from the admin form; only overwrite it when explicitly sent.
    if (goal_amount !== undefined && goal_amount !== null && goal_amount !== '') {
      projectData.goal_amount = parseFloat(goal_amount) || 0.00;
    }

    await pool.query(
      'UPDATE `projects` SET ? WHERE `id` = ?',
      [projectData, req.params.id]
    );

    console.log(`Project updated successfully: ${req.params.id}`);
    res.json({ success: true, project: { id: req.params.id, ...projectData, budget_json } });
  } catch (err) {
    console.error('API Error PUT /api/projects/:id:', err);
    res.status(500).json({ error: 'Database error updating project' });
  }
});

// DELETE /api/projects/:id - Delete a project (Admin only)
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM `projects` WHERE `id` = ?', [req.params.id]);
    console.log(`Project deleted successfully: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('API Error DELETE /api/projects/:id:', err);
    res.status(500).json({ error: 'Database error deleting project' });
  }
});

// POST /api/upload - Handle file upload and return its public URL path (converts to Base64 for Hostinger persistence)
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    // Read local uploaded file to Buffer
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    // Construct base64 Data URI
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    
    // Delete local temporary file from disk immediately to save space on Hostinger
    fs.unlinkSync(req.file.path);
    
    console.log(`Image uploaded and converted to Base64 successfully (${req.file.size} bytes).`);
    res.json({ publicUrl: dataUri });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'Error processing file.' });
  }
});

// GET /api/initiatives - Retrieve all initiatives, optionally filtered by project_id (with admin support for all=true)
app.get('/api/initiatives', async (req, res) => {
  try {
    const projectId = req.query.project_id;
    const showAll = req.query.all === 'true';
    let rows;
    
    let query = 'SELECT * FROM `initiatives`';
    const params = [];
    
    if (projectId) {
      query += ' WHERE `project_id` = ?';
      params.push(projectId);
      if (!showAll) {
        query += ' AND `status` = "active"';
      }
    } else if (!showAll) {
      query += ' WHERE `status` = "active"';
    }
    
    query += ' ORDER BY `created_at` DESC';
    [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('API Error /api/initiatives:', err);
    res.status(500).json({ error: 'Database error fetching initiatives' });
  }
});

// GET /api/initiatives/:id - Retrieve details of a single initiative
app.get('/api/initiatives/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `initiatives` WHERE `id` = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('API Error /api/initiatives/:id:', err);
    res.status(500).json({ error: 'Database error fetching initiative' });
  }
});

// POST /api/initiatives - Create a new solidarity initiative
app.post('/api/initiatives', async (req, res) => {
  try {
    const { project_id, title, type, description, suggested_price, impact_description, image_url, goal_amount, created_by_user } = req.body;
    
    if (!project_id || !title || !type || !suggested_price || !impact_description) {
      return res.status(400).json({ error: 'Missing required fields (project_id, title, type, suggested_price, impact_description).' });
    }

    const rawId = slugify(title);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const id = `${rawId}-${uniqueSuffix}`;

    const initiativeData = {
      id,
      project_id,
      title,
      type,
      description: description || '',
      suggested_price: parseFloat(suggested_price),
      impact_description,
      image_url: image_url || 'https://picsum.photos/seed/default-initiative/800/600',
      goal_amount: parseFloat(goal_amount || 0),
      raised_amount: 0.00,
      status: 'active',
      created_by_user: created_by_user || 'user_submission'
    };

    await pool.query('INSERT INTO `initiatives` SET ?', initiativeData);
    console.log(`New solidarity initiative created successfully: ${id}`);
    
    res.status(201).json({ success: true, initiative: initiativeData });
  } catch (err) {
    console.error('API Error POST /api/initiatives:', err);
    res.status(500).json({ error: 'Database error creating initiative' });
  }
});

// PUT /api/initiatives/:id - Update an existing solidarity initiative (Admin only)
app.put('/api/initiatives/:id', async (req, res) => {
  try {
    const { project_id, title, type, description, suggested_price, impact_description, image_url, goal_amount, status } = req.body;
    
    if (!project_id || !title || !type || !suggested_price || !impact_description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const initiativeData = {
      project_id,
      title,
      type,
      description: description || '',
      suggested_price: parseFloat(suggested_price),
      impact_description,
      image_url: image_url || null,
      goal_amount: parseFloat(goal_amount || 0),
      status: status || 'active'
    };

    await pool.query(
      'UPDATE `initiatives` SET ? WHERE `id` = ?',
      [initiativeData, req.params.id]
    );

    console.log(`Initiative updated successfully: ${req.params.id}`);
    res.json({ success: true, initiative: { id: req.params.id, ...initiativeData } });
  } catch (err) {
    console.error('API Error PUT /api/initiatives/:id:', err);
    res.status(500).json({ error: 'Database error updating initiative' });
  }
});

// DELETE /api/initiatives/:id - Delete an initiative (Admin only)
app.delete('/api/initiatives/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM `initiatives` WHERE `id` = ?', [req.params.id]);
    console.log(`Initiative deleted successfully: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('API Error DELETE /api/initiatives/:id:', err);
    res.status(500).json({ error: 'Database error deleting initiative' });
  }
});

// --- NATIVE AUTHENTICATION ENDPOINTS (MySQL) ---

// POST /api/auth/register - Register a new NGO staff member
app.post('/api/auth/register', async (req, res) => {
  try {
    const { display_name, email, password } = req.body;

    if (!display_name || !email || !password) {
      return res.status(400).json({ error: 'Display name, email, and password are required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify if user already exists
    const [existing] = await pool.query('SELECT id FROM `users` WHERE `email` = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Generate unique ID and secure password cryptography hash + salt
    const id = `user-${Math.random().toString(36).substring(2, 11)}`;
    const { hash, salt } = hashPassword(password);
    const role = 'staff'; // Default role for registrations

    const userData = {
      id,
      display_name,
      email: normalizedEmail,
      password_hash: hash,
      password_salt: salt,
      role
    };

    await pool.query('INSERT INTO `users` SET ?', userData);
    console.log(`Staff registered successfully: ${normalizedEmail}`);

    // Generate signed session token
    const token = generateToken({ id, role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id,
        display_name,
        email: normalizedEmail,
        role
      }
    });
  } catch (err) {
    console.error('API Error /api/auth/register:', err);
    res.status(500).json({ error: 'Database error registering staff.' });
  }
});

// POST /api/auth/login - Authenticate staff credentials and return signed token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user credentials
    const [rows] = await pool.query('SELECT * FROM `users` WHERE `email` = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password securely
    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate signed session token
    const token = generateToken({ id: user.id, role: user.role });
    console.log(`Staff logged in successfully: ${normalizedEmail}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('API Error /api/auth/login:', err);
    res.status(500).json({ error: 'Database error authenticating staff.' });
  }
});

// POST /api/auth/forgot-password - Email a one-time reset link to the account's e-mail and recovery e-mail
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required.', code: 'MISSING_FIELDS' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (rateLimited(`forgot-ip:${clientIp(req)}`, 10, 60 * 60 * 1000) || rateLimited(`forgot:${normalizedEmail}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' });
    }

    // The address may be the account e-mail or the registered recovery e-mail.
    let [users] = await pool.query('SELECT id, display_name, email, recovery_email FROM `users` WHERE `email` = ?', [normalizedEmail]);
    if (users.length === 0) {
      [users] = await pool.query('SELECT id, display_name, email, recovery_email FROM `users` WHERE `recovery_email` = ? LIMIT 5', [normalizedEmail]);
    }

    for (const user of users) {
      const token = crypto.randomBytes(32).toString('base64url');
      await pool.query('UPDATE `password_resets` SET `used_at` = NOW() WHERE `user_id` = ? AND `used_at` IS NULL', [user.id]);
      await pool.query(
        'INSERT INTO `password_resets` (`id`, `user_id`, `token_hash`, `expires_at`) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
        [crypto.randomUUID(), user.id, sha256(token), RESET_LINK_TTL_MINUTES]
      );

      const link = `${getAppUrl()}/reset-password?token=${token}`;
      const subject = 'Redefinição de senha - Building Bridges';
      const text = `Olá, ${user.display_name}.\n\nRecebemos um pedido para redefinir a senha da sua conta. Use o link abaixo (válido por ${RESET_LINK_TTL_MINUTES} minutos, uso único):\n\n${link}\n\nSe você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.`;
      const html = mailLayout('Redefinição de senha', `
        <p>Olá, ${escapeHtml(user.display_name)}.</p>
        <p>Recebemos um pedido para redefinir a senha da sua conta. O link abaixo vale por ${RESET_LINK_TTL_MINUTES} minutos e só pode ser usado uma vez.</p>
        <p style="margin:24px 0"><a href="${link}" style="background:#FF8C00;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Criar nova senha</a></p>
        <p style="color:#64748b;font-size:13px">Se o botão não funcionar, copie este endereço: ${link}</p>
        <p style="color:#64748b;font-size:13px">Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.</p>`);

      // Sent in the background so the response time does not reveal whether the account exists.
      [...new Set([user.email, user.recovery_email].filter(Boolean))].forEach((to) => { void sendMail({ to, subject, text, html }); });
      console.log(`[PASSWORD RESET] Reset link issued for user ${user.id}.`);
    }

    // Always the same answer so this endpoint cannot be used to discover which e-mails are registered.
    res.json({ success: true, message: 'If the address is registered, reset instructions have been sent.' });
  } catch (err) {
    console.error('API Error /api/auth/forgot-password:', err);
    res.status(500).json({ error: 'Database error processing password recovery.' });
  }
});

// POST /api/auth/reset-password - Set a new password using the one-time link received by e-mail
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || typeof token !== 'string' || !new_password) {
      return res.status(400).json({ error: 'Token and new password are required.', code: 'MISSING_FIELDS' });
    }
    if (rateLimited(`reset-ip:${clientIp(req)}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' });
    }
    const weak = validateNewPassword(new_password);
    if (weak) return res.status(400).json({ error: weak, code: 'WEAK_PASSWORD' });

    const [rows] = await pool.query(
      'SELECT `id`, `user_id` FROM `password_resets` WHERE `token_hash` = ? AND `used_at` IS NULL AND `expires_at` > NOW() LIMIT 1',
      [sha256(token)]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'This link is invalid or has expired.', code: 'INVALID_TOKEN' });
    }

    // Consume the link first; the affected-rows check makes it strictly single use even under races.
    const [consumed] = await pool.query('UPDATE `password_resets` SET `used_at` = NOW() WHERE `id` = ? AND `used_at` IS NULL', [rows[0].id]);
    if (consumed.affectedRows !== 1) {
      return res.status(400).json({ error: 'This link is invalid or has expired.', code: 'INVALID_TOKEN' });
    }

    const { hash, salt } = hashPassword(new_password);
    await pool.query('UPDATE `users` SET `password_hash` = ?, `password_salt` = ? WHERE `id` = ?', [hash, salt, rows[0].user_id]);
    await pool.query('UPDATE `password_resets` SET `used_at` = NOW() WHERE `user_id` = ? AND `used_at` IS NULL', [rows[0].user_id]);

    const [users] = await pool.query('SELECT `email`, `recovery_email` FROM `users` WHERE `id` = ?', [rows[0].user_id]);
    if (users[0]) notifyAccountChange(users[0], 'Sua senha foi redefinida', 'A senha da sua conta Building Bridges acabou de ser redefinida por meio de um link de recuperação.');

    console.log(`[PASSWORD RESET] Password reset completed for user ${rows[0].user_id}.`);
    res.json({ success: true });
  } catch (err) {
    console.error('API Error /api/auth/reset-password:', err);
    res.status(500).json({ error: 'Database error resetting password.' });
  }
});

// POST /api/auth/change-password - Logged-in user changes their own password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Authorization token required.', code: 'UNAUTHORIZED' });

    if (rateLimited(`chpw:${user.id}`, 8, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' });
    }

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password are required.', code: 'MISSING_FIELDS' });
    }
    if (!verifyPassword(current_password, user.password_hash, user.password_salt)) {
      return res.status(403).json({ error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' });
    }
    const weak = validateNewPassword(new_password);
    if (weak) return res.status(400).json({ error: weak, code: 'WEAK_PASSWORD' });
    if (new_password === current_password) {
      return res.status(400).json({ error: 'The new password must be different from the current one.', code: 'SAME_PASSWORD' });
    }

    const { hash, salt } = hashPassword(new_password);
    await pool.query('UPDATE `users` SET `password_hash` = ?, `password_salt` = ? WHERE `id` = ?', [hash, salt, user.id]);
    // Any reset link requested before this change is no longer valid.
    await pool.query('UPDATE `password_resets` SET `used_at` = NOW() WHERE `user_id` = ? AND `used_at` IS NULL', [user.id]);

    notifyAccountChange(user, 'Sua senha foi alterada', 'A senha da sua conta Building Bridges acabou de ser alterada.');
    console.log(`[ACCOUNT] Password changed for user ${user.id}.`);
    res.json({ success: true });
  } catch (err) {
    console.error('API Error /api/auth/change-password:', err);
    res.status(500).json({ error: 'Database error changing password.' });
  }
});

// PUT /api/auth/recovery-email - Set, change or remove the recovery e-mail (needs the current password)
app.put('/api/auth/recovery-email', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Authorization token required.', code: 'UNAUTHORIZED' });

    if (rateLimited(`recovery:${user.id}`, 8, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' });
    }

    const { recovery_email, current_password } = req.body;
    if (!current_password || !verifyPassword(current_password, user.password_hash, user.password_salt)) {
      return res.status(403).json({ error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' });
    }

    const value = typeof recovery_email === 'string' ? recovery_email.toLowerCase().trim() : '';
    if (value) {
      if (value.length > 255 || !EMAIL_PATTERN.test(value)) {
        return res.status(400).json({ error: 'Invalid e-mail address.', code: 'INVALID_EMAIL' });
      }
      if (value === user.email) {
        return res.status(400).json({ error: 'The recovery e-mail must be different from the account e-mail.', code: 'SAME_AS_PRIMARY' });
      }
    }

    await pool.query('UPDATE `users` SET `recovery_email` = ? WHERE `id` = ?', [value || null, user.id]);

    // The previous recovery address is told too, so a silent swap by someone else would be noticed.
    const message = value
      ? `O e-mail de recuperação da sua conta Building Bridges foi definido como ${value}.`
      : 'O e-mail de recuperação da sua conta Building Bridges foi removido.';
    notifyAccountChange({ email: user.email, recovery_email: value || null }, 'E-mail de recuperação atualizado', message, [user.recovery_email]);
    console.log(`[ACCOUNT] Recovery e-mail updated for user ${user.id}.`);
    res.json({ success: true, recovery_email: value || null });
  } catch (err) {
    console.error('API Error /api/auth/recovery-email:', err);
    res.status(500).json({ error: 'Database error updating recovery e-mail.' });
  }
});

// GET /api/auth/me - Verify session token and retrieve logged-in user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    // Fetch up-to-date user details from MySQL
    const [rows] = await pool.query('SELECT id, display_name, email, recovery_email, role, created_at FROM `users` WHERE `id` = ?', [payload.id]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('API Error /api/auth/me:', err);
    res.status(500).json({ error: 'Database error verifying session.' });
  }
});

// --- DUAL-GATEWAY CHECKOUT INTEGRATION (Stripe & Mercado Pago) ---

// POST /api/checkout/create-session - Generate hosted checkout sessions
app.post('/api/checkout/create-session', async (req, res) => {
  try {
    const { initiative_id, project_id, amount, currency, name, email, phone, notes } = req.body;

    // Determine the base URL dynamically based on request origin to support seamless local, staging, and production redirects
    let appBaseUrl = process.env.APP_URL;
    try {
      const requestOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '');
      if (requestOrigin && requestOrigin.includes('buildingbridgesbrusa.org')) {
        appBaseUrl = 'https://buildingbridgesbrusa.org';
      } else if (requestOrigin && !requestOrigin.includes('localhost') && !requestOrigin.includes('127.0.0.1')) {
        appBaseUrl = requestOrigin;
      }
    } catch (err) {
      console.error('Failed to parse referer/origin for dynamic base URL:', err);
    }
    if (!appBaseUrl) {
      appBaseUrl = 'http://localhost:3000';
    }

    if ((!initiative_id && !project_id) || !amount || !currency || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields (initiative_id or project_id, amount, currency, name, email, phone).' });
    }

    let title = '';
    let description = '';
    let imageUrl = '';
    const value = parseFloat(amount);

    if (project_id) {
      // 1a. Fetch project details from MySQL to verify
      const [projRows] = await pool.query('SELECT * FROM `projects` WHERE `id` = ?', [project_id]);
      if (projRows.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      title = projRows[0].name;
      description = projRows[0].description || '';
      imageUrl = projRows[0].image_url;
    } else {
      // 1b. Fetch initiative details from MySQL to verify
      const [initRows] = await pool.query('SELECT * FROM `initiatives` WHERE `id` = ?', [initiative_id]);
      if (initRows.length === 0) {
        return res.status(404).json({ error: 'Initiative not found.' });
      }
      title = initRows[0].title;
      description = initRows[0].description || '';
      imageUrl = initRows[0].image_url;
    }

    // Filter out any Base64 strings or invalid URLs for payment gateway compatibility (Stripe limits to 2048 chars)
    const stripeImages = [];
    let cleanImageUrl = '';
    if (imageUrl && typeof imageUrl === 'string') {
      const parts = imageUrl.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if ((trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !trimmed.startsWith('data:') && trimmed.length <= 2048) {
          stripeImages.push(trimmed);
        }
      }
    }
    if (stripeImages.length > 0) {
      cleanImageUrl = stripeImages[0];
    }

    // Unique reference to keep track of the transaction
    const transactionId = `tx-${Math.random().toString(36).substring(2, 11)}`;

    // 2. Route dynamically by selected currency
    if (currency === 'BRL') {
      // --- MERCADO PAGO CHECKOUT PRO (BRL) ---
      const mpPreferenceUrl = 'https://api.mercadopago.com/v1/preferences';
      
      const payload = {
        items: [
          {
            id: project_id ? project_id : initiative_id,
            title: title,
            description: description ? description.substring(0, 255) : '',
            picture_url: cleanImageUrl || null,
            category_id: 'donations',
            quantity: 1,
            unit_price: value
          }
        ],
        payer: {
          name: name,
          email: email,
          phone: {
            number: phone
          }
        },
        back_urls: {
          success: `${appBaseUrl}${project_id ? `/impact/${project_id}` : '/action-hub'}?gateway=mercadopago&success=true&pref_id=${transactionId}&init_id=${initiative_id || ''}&proj_id=${project_id || ''}`,
          failure: `${appBaseUrl}${project_id ? `/impact/${project_id}` : '/action-hub'}?canceled=true`
        },
        auto_return: 'approved',
        external_reference: transactionId,
        metadata: {
          initiative_id: initiative_id || null,
          project_id: project_id || null,
          supporter_name: name,
          supporter_email: email,
          supporter_phone: phone,
          additional_notes: notes || '',
          currency
        }
      };

      console.log(`[PAYMENT MP] Generating BRL preference for amount: ${value}`);
      const mpResponse = await fetch(mpPreferenceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-701389814429987-052618-9776b6d510db2a45da02c7d9bdc99b82-243003058'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const mpData = await mpResponse.json();
      if (!mpResponse.ok) {
        throw new Error(mpData.message || 'Mercado Pago preference creation failed');
      }

      console.log(`[PAYMENT MP] Preference created. Redirect URL: ${mpData.init_point}`);
      return res.json({ redirectUrl: mpData.init_point, transactionId });
    } else {
      // --- STRIPE CHECKOUT SESSION (USD) ---
      console.log(`[PAYMENT STRIPE] Generating USD Checkout Session for amount: ${value}`);
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: title,
                images: stripeImages,
                description: description ? description.substring(0, 255) : '',
              },
              unit_amount: Math.round(value * 100), // Stripe counts in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appBaseUrl}${project_id ? `/impact/${project_id}` : '/action-hub'}?gateway=stripe&success=true&session_id={CHECKOUT_SESSION_ID}&init_id=${initiative_id || ''}&proj_id=${project_id || ''}`,
        cancel_url: `${appBaseUrl}${project_id ? `/impact/${project_id}` : '/action-hub'}?canceled=true`,
        customer_email: email,
        metadata: {
          initiative_id: initiative_id || null,
          project_id: project_id || null,
          supporter_name: name,
          supporter_email: email,
          supporter_phone: phone,
          additional_notes: notes || '',
          currency
        }
      });

      console.log(`[PAYMENT STRIPE] Session created. Redirect URL: ${session.url}`);
      return res.json({ redirectUrl: session.url, transactionId: session.id });
    }
  } catch (err) {
    console.error('API Error /api/checkout/create-session:', err);
    res.status(500).json({ error: err.message || 'Error creating payment session.' });
  }
});

// POST /api/checkout/verify-session - Securely confirm payment status and record to MySQL
app.post('/api/checkout/verify-session', async (req, res) => {
  try {
    const { gateway, session_id, payment_id } = req.body;

    if (!gateway || (!session_id && !payment_id)) {
      return res.status(400).json({ error: 'Missing required validation fields.' });
    }

    let verifiedAmount = 0;
    let currency = 'USD';
    let supporterName = '';
    let supporterEmail = '';
    let supporterPhone = '';
    let notes = '';
    let initiativeId = null;
    let projectId = null;
    let transactionRef = '';

    if (gateway === 'stripe') {
      console.log(`[VERIFY STRIPE] Fetching session details for: ${session_id}`);
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Stripe transaction has not been paid.' });
      }

      verifiedAmount = session.amount_total / 100;
      currency = session.currency.toUpperCase();
      supporterName = session.metadata.supporter_name;
      supporterEmail = session.metadata.supporter_email;
      supporterPhone = session.metadata.supporter_phone;
      notes = session.metadata.additional_notes;
      initiativeId = session.metadata.initiative_id || null;
      projectId = session.metadata.project_id || null;
      transactionRef = session.id;
    } else if (gateway === 'mercadopago') {
      console.log(`[VERIFY MP] Fetching payment details for ID: ${payment_id}`);
      
      // Let's call Mercado Pago's Payment API to check approval
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-701389814429987-052618-9776b6d510db2a45da02c7d9bdc99b82-243003058'}`
        }
      });
      
      const mpData = await mpResponse.json();
      if (!mpResponse.ok) {
        throw new Error(mpData.message || 'Mercado Pago payment query failed');
      }

      if (mpData.status !== 'approved') {
        return res.status(400).json({ error: `Mercado Pago payment status is: ${mpData.status}` });
      }

      verifiedAmount = parseFloat(mpData.transaction_amount);
      currency = 'BRL';
      
      // MP payment contains external_reference or metadata
      supporterName = mpData.metadata?.supporter_name || mpData.payer?.first_name || 'Supporter';
      supporterEmail = mpData.metadata?.supporter_email || mpData.payer?.email || 'email@example.com';
      supporterPhone = mpData.metadata?.supporter_phone || mpData.payer?.phone?.number || '';
      notes = mpData.metadata?.additional_notes || '';
      initiativeId = mpData.metadata?.initiative_id || null;
      projectId = mpData.metadata?.project_id || null;
      transactionRef = payment_id.toString();
    } else {
      return res.status(400).json({ error: 'Invalid gateway specified.' });
    }

    // 3. MySQL Transaction: Save contribution and increment raised amount safely using helper
    const result = await saveVerifiedContribution({
      gateway,
      verifiedAmount,
      currency,
      supporterName,
      supporterEmail,
      supporterPhone,
      notes,
      initiativeId,
      projectId,
      transactionRef
    });

    res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed || false,
      contribution: result.contribution,
      initiativeTitle: result.initiativeTitle
    });
  } catch (err) {
    console.error('API Error /api/checkout/verify-session:', err);
    res.status(500).json({ error: err.message || 'Database error validating pledge.' });
  }
});

// GET /api/contributions - Retrieve all contributions (Protected)
app.get('/api/contributions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'staff')) {
      return res.status(403).json({ error: 'Administrative privileges required.' });
    }

    // Join with initiatives and projects to display the correct titles
    const [rows] = await pool.query(`
      SELECT c.*, 
             i.title as initiative_title, 
             COALESCE(p_direct.name, p_init.name) as project_name
      FROM \`contributions\` c
      LEFT JOIN \`initiatives\` i ON c.initiative_id = i.id
      LEFT JOIN \`projects\` p_init ON i.project_id = p_init.id
      LEFT JOIN \`projects\` p_direct ON c.project_id = p_direct.id
      ORDER BY c.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('API Error GET /api/contributions:', err);
    res.status(500).json({ error: 'Database error fetching contributions list.' });
  }
});

// POST /api/contributions/:id/status - Update contribution status (Protected)
app.post('/api/contributions/:id/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'staff')) {
      return res.status(403).json({ error: 'Administrative privileges required.' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    await pool.query(
      'UPDATE `contributions` SET `status` = ? WHERE `id` = ?',
      [status, req.params.id]
    );

    console.log(`[UPDATE STATUS] Contribution ${req.params.id} updated to status: ${status}`);
    res.json({ success: true, status });
  } catch (err) {
    console.error('API Error POST /api/contributions/:id/status:', err);
    res.status(500).json({ error: 'Database error updating contribution status.' });
  }
});

// Handle Serve Client SPA Frontend in Production
// --- SEO: canonical host, legacy redirects, dynamic sitemap and per-route <head> (see seo-meta.js) ---

// Canonical address of the site (used for canonical links, og:url, og:image and the sitemap).
const SITE_URL = (process.env.SITE_URL || 'https://buildingbridgesbrusa.org').replace(/\/+$/, '');
const SITE_HOST = new URL(SITE_URL).host;
const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const PRIVATE_DESCRIPTION = 'Building Bridges Foundation — humanitarian disaster relief in Brazil and the USA.';

// www.<domain> -> <domain> (one canonical host, otherwise every page exists twice for search engines)
app.use((req, res, next) => {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  if (host === `www.${SITE_HOST}`) {
    return res.redirect(301, `${SITE_URL}${req.originalUrl}`);
  }
  next();
});

// Removed pages and trailing slashes: permanent redirects instead of duplicates / soft 404s.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/assets/')) return next();
  const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  const cleanPath = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
  const target = LEGACY_REDIRECTS[cleanPath];
  if (target) return res.redirect(301, target);
  if (cleanPath !== req.path && !/\.[a-z0-9]{2,5}$/i.test(cleanPath)) return res.redirect(301, cleanPath + query);
  next();
});

// Sitemap generated from the database, so every published project is listed.
app.get('/sitemap.xml', async (req, res) => {
  let projects = [];
  try {
    if (pool) {
      const [rows] = await pool.query("SELECT `id`, `created_at` FROM `projects` WHERE `status` <> 'archive' ORDER BY `created_at` DESC");
      projects = rows.map((r) => ({ id: r.id, lastmod: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : undefined }));
    }
  } catch (err) {
    console.error('Sitemap: could not read projects, listing static pages only:', err.message);
  }
  res.set('Cache-Control', 'public, max-age=3600').type('application/xml').send(buildSitemapXml(SITE_URL, projects));
});

// Link-preview image and icons (Open Graph / Twitter / favicon). They are served by Node under their own path on
// purpose: on this hosting (LiteSpeed + Passenger) the web server in front of Node answers root-level static file
// names (/og-image.png, /favicon.ico ...) by itself, from a cache that can stay stale after a deploy and return 404
// for files that already exist in the app folder. A dedicated path always reaches this handler.
const SHARE_FILES = { 'og-image.png': 'image/png', 'icon-192.png': 'image/png', 'icon-512.png': 'image/png', 'apple-touch-icon.png': 'image/png', 'favicon.ico': 'image/x-icon' };
app.get('/share/:file', (req, res) => {
  const type = SHARE_FILES[req.params.file];
  const file = type && [path.join(__dirname, 'dist', req.params.file), path.join(__dirname, 'public', req.params.file)].find((f) => fs.existsSync(f));
  if (!file) return res.status(404).type('text/plain').send('Not found');
  res.set('Cache-Control', 'public, max-age=86400').type(type).sendFile(file);
});

const clientBuildDir = path.join(__dirname, 'dist');
if (fs.existsSync(clientBuildDir)) {
  // index: false -> "/" also goes through the SEO handler below instead of the raw index.html
  app.use(express.static(clientBuildDir, {
    index: false,
    setHeaders(res, filePath) {
      const normalized = filePath.split(path.sep).join('/');
      if (normalized.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // hashed file names
      } else if (/\/(sw\.js|registerSW\.js|manifest\.json|workbox-[^/]+\.js)$/.test(normalized)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  let indexCache = { mtime: 0, html: '' };
  const readIndexHtml = () => {
    const file = path.join(clientBuildDir, 'index.html');
    const { mtimeMs } = fs.statSync(file);
    if (mtimeMs !== indexCache.mtime) indexCache = { mtime: mtimeMs, html: fs.readFileSync(file, 'utf8') };
    return indexCache.html;
  };

  // App shell for every real route, with the <head> rewritten for that route.
  app.get('*', async (req, res) => {
    const p = req.path;

    // Missing API endpoints / files must be real 404s, not the HTML shell.
    if (p.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    if (p.startsWith('/uploads/') || p.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(p)) {
      return res.status(404).type('text/plain').send('Not found');
    }

    let status = 200;
    let seo;
    const projectId = matchProjectPath(p);

    if (PUBLIC_PAGES[p]) {
      seo = { path: p, title: PUBLIC_PAGES[p].title, description: PUBLIC_PAGES[p].description, robots: INDEXABLE_ROBOTS };
    } else if (PRIVATE_PAGES[p]) {
      res.set('X-Robots-Tag', 'noindex, nofollow');
      if (p === '/reset-password') res.set('Referrer-Policy', 'no-referrer'); // the URL carries the one-time token
      seo = { path: p, title: PRIVATE_PAGES[p], description: PRIVATE_DESCRIPTION, robots: 'noindex, nofollow' };
    } else if (projectId) {
      seo = { path: p, title: 'Humanitarian Project | Building Bridges', description: PUBLIC_PAGES['/projects'].description, robots: INDEXABLE_ROBOTS };
      try {
        if (pool) {
          const [rows] = await pool.query('SELECT `name`, `description`, `long_description`, `image_url` FROM `projects` WHERE `id` = ? LIMIT 1', [projectId]);
          if (rows.length === 0) {
            status = 404;
            res.set('X-Robots-Tag', 'noindex, nofollow');
            seo = { path: p, title: 'Project not found | Building Bridges', description: PRIVATE_DESCRIPTION, robots: 'noindex, nofollow' };
          } else {
            const project = rows[0];
            seo.title = `${project.name} | Building Bridges`;
            seo.description = truncate(project.description || project.long_description, 200) || seo.description;
            seo.image = absoluteImageUrl(project.image_url, SITE_URL);
            seo.imageAlt = project.name;
          }
        }
      } catch (err) {
        // Database hiccup: keep the generic (indexable) tags rather than deindexing a valid page.
        console.error('SEO: could not load project for', p, err.message);
      }
    } else {
      status = 404;
      res.set('X-Robots-Tag', 'noindex, nofollow');
      seo = { path: p, title: 'Page not found | Building Bridges', description: PRIVATE_DESCRIPTION, robots: 'noindex, nofollow' };
    }

    try {
      const html = injectSeoBlock(readIndexHtml(), buildSeoBlock({ siteUrl: SITE_URL, ...seo }));
      res.status(status).set('Cache-Control', 'no-cache').type('html').send(html);
    } catch (err) {
      console.error('SEO: falling back to the plain index.html:', err.message);
      res.sendFile(path.join(clientBuildDir, 'index.html'));
    }
  });
}

// Start Server and Init Database
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});
