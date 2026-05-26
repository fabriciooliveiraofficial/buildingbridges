import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return derivedKey.toString('hex') === hash;
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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Express middlewares
app.use(cors());
app.use(express.json());

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
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'building_bridges',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

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
  try {
    // Attempt connecting to the server first without database to create it if missing (for local testing)
    const initConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await initConnection.end();

    // Now establish connection pool with the specific database
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MySQL connection pool successfully.');

    // Create the 'projects' table if it does not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`goal_amount\` DECIMAL(15, 2) NOT NULL,
        \`raised_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`image_url\` VARCHAR(512) NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'active',
        \`category\` VARCHAR(100) NULL,
        \`long_description\` TEXT NULL,
        \`budget_json\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_status (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create the 'initiatives' table if it does not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`initiatives\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`project_id\` VARCHAR(255) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`suggested_price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`impact_description\` VARCHAR(255) NOT NULL,
        \`image_url\` VARCHAR(512) NULL,
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
    
    console.log('Database tables verified.');

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
    console.error('Failed to initialize database:', error.message);
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
    
    if (!name || !goal_amount) {
      return res.status(400).json({ error: 'Name and goal_amount are required fields.' });
    }

    // Generate a unique URL slug id from the project name
    const rawId = slugify(name);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const id = `${rawId}-${uniqueSuffix}`;

    const projectData = {
      id,
      name,
      description: description || null,
      goal_amount: parseFloat(goal_amount),
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

// POST /api/upload - Handle file upload and return its public URL path
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    // Return relative url path that is compatible with both dev proxy and direct hosting
    const publicUrl = `/uploads/${req.file.filename}`;
    console.log(`Image uploaded successfully: ${publicUrl}`);
    res.json({ publicUrl });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'Error uploading file.' });
  }
});

// GET /api/initiatives - Retrieve all active initiatives, optionally filtered by project_id
app.get('/api/initiatives', async (req, res) => {
  try {
    const projectId = req.query.project_id;
    let rows;
    
    if (projectId) {
      [rows] = await pool.query('SELECT * FROM `initiatives` WHERE `project_id` = ? AND `status` = "active" ORDER BY `created_at` DESC', [projectId]);
    } else {
      [rows] = await pool.query('SELECT * FROM `initiatives` WHERE `status` = "active" ORDER BY `created_at` DESC');
    }
    
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

// POST /api/auth/forgot-password - Password recovery request
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user exists in MySQL
    const [rows] = await pool.query('SELECT id, display_name FROM `users` WHERE `email` = ?', [normalizedEmail]);
    
    // Log the request to server console for admin/developer convenience
    console.log(`[PASSWORD RESET] Request received for: ${normalizedEmail}`);
    if (rows.length === 0) {
      console.log(`[PASSWORD RESET] User with email ${normalizedEmail} does not exist in MySQL.`);
    } else {
      console.log(`[PASSWORD RESET] User found: ${rows[0].display_name} (ID: ${rows[0].id}).`);
      console.log(`[PASSWORD RESET] TIP: To reset manually, run: UPDATE users SET password_hash = 'NEW_HASH', password_salt = 'NEW_SALT' WHERE email = '${normalizedEmail}';`);
    }

    // Always return success to prevent user enumeration attacks and matches Firebase behavior
    res.json({
      success: true,
      message: 'Reset instructions have been processed.'
    });
  } catch (err) {
    console.error('API Error /api/auth/forgot-password:', err);
    res.status(500).json({ error: 'Database error processing password recovery.' });
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
    const [rows] = await pool.query('SELECT id, display_name, email, role, created_at FROM `users` WHERE `id` = ?', [payload.id]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('API Error /api/auth/me:', err);
    res.status(500).json({ error: 'Database error verifying session.' });
  }
});

// Handle Serve Client SPA Frontend in Production
const clientBuildDir = path.join(__dirname, 'dist');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  
  // Serve react router index.html for any unknown route (SPA client-side routing fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

// Start Server and Init Database
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});
