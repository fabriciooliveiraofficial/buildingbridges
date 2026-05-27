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

// Load environment variables immediately
dotenv.config();

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyPlaceholder');

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Express middlewares
app.use(cors());
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
      error: 'Conexão com o banco de dados MySQL falhou. Por favor, verifique se o serviço local do MySQL (ex: XAMPP, WampServer ou MySQL nativo) está rodando na porta 3306 e se as credenciais no arquivo .env estão corretas. (Database connection failed. Please ensure your local MySQL server is running and configured correctly in your .env file).'
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
    try {
      const initConnection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password
      });
      
      await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await initConnection.end();
      console.log('Database verified/created successfully.');
    } catch (dbCreateError) {
      console.log('Skipping initial DB creation (normal for production platforms like Hostinger where the DB already exists).');
    }

    // Now establish connection pool with the specific database
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MySQL connection pool successfully.');

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

// PUT /api/projects/:id - Update an existing project (Admin only)
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, description, goal_amount, image_url, status, category, long_description, budget_json } = req.body;
    
    if (!name || !goal_amount) {
      return res.status(400).json({ error: 'Name and goal_amount are required fields.' });
    }

    const projectData = {
      name,
      description: description || null,
      goal_amount: parseFloat(goal_amount),
      image_url: image_url || null,
      status: status || 'active',
      category: category || null,
      long_description: long_description || null,
      budget_json: budget_json ? JSON.stringify(budget_json) : null
    };

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

// --- DUAL-GATEWAY CHECKOUT INTEGRATION (Stripe & Mercado Pago) ---

// POST /api/checkout/create-session - Generate hosted checkout sessions
app.post('/api/checkout/create-session', async (req, res) => {
  try {
    const { initiative_id, project_id, amount, currency, name, email, phone, notes } = req.body;

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
            picture_url: imageUrl,
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
          success: `${process.env.APP_URL || 'http://localhost:3000'}${project_id ? `/impact/${project_id}` : '/action-hub'}?gateway=mercadopago&success=true&pref_id=${transactionId}&init_id=${initiative_id || ''}&proj_id=${project_id || ''}`,
          failure: `${process.env.APP_URL || 'http://localhost:3000'}${project_id ? `/impact/${project_id}` : '/action-hub'}?canceled=true`
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
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: title,
                images: imageUrl ? [imageUrl] : [],
                description: description ? description.substring(0, 255) : '',
              },
              unit_amount: Math.round(value * 100), // Stripe counts in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}${project_id ? `/impact/${project_id}` : '/action-hub'}?gateway=stripe&success=true&session_id={CHECKOUT_SESSION_ID}&init_id=${initiative_id || ''}&proj_id=${project_id || ''}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}${project_id ? `/impact/${project_id}` : '/action-hub'}?canceled=true`,
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
  let dbConnection;
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

    // 3. MySQL Transaction: Save contribution and increment raised amount safely
    dbConnection = await pool.getConnection();
    await dbConnection.beginTransaction();

    // Check if transaction has already been registered
    const [existing] = await dbConnection.query('SELECT id FROM `contributions` WHERE `transaction_reference` = ?', [transactionRef]);
    
    if (existing.length > 0) {
      console.log(`[VERIFY] Pledged transaction already registered: ${transactionRef}`);
      await dbConnection.rollback();
      
      // Already registered, return existing profile for receipt reproduction
      const [contributionRows] = await pool.query('SELECT * FROM `contributions` WHERE `transaction_reference` = ?', [transactionRef]);
      
      let title = 'Missão Urgent';
      if (initiativeId) {
        const [initiativeRows] = await pool.query('SELECT title FROM `initiatives` WHERE `id` = ?', [initiativeId]);
        title = initiativeRows[0]?.title || 'Ação Solidária';
      } else if (projectId) {
        const [projectRows] = await pool.query('SELECT name FROM `projects` WHERE `id` = ?', [projectId]);
        title = projectRows[0]?.name || 'Missão Urgente';
      }
      
      return res.json({
        success: true,
        alreadyProcessed: true,
        contribution: contributionRows[0],
        initiativeTitle: title
      });
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
    console.log(`[VERIFY SUCCESS] Contribution successfully registered: ${contributionId}`);

    let title = 'Missão Urgent';
    if (initiativeId) {
      const [initiativeRows] = await pool.query('SELECT title FROM `initiatives` WHERE `id` = ?', [initiativeId]);
      title = initiativeRows[0]?.title || 'Ação Solidária';
    } else if (projectId) {
      const [projectRows] = await pool.query('SELECT name FROM `projects` WHERE `id` = ?', [projectId]);
      title = projectRows[0]?.name || 'Missão Urgente';
    }

    res.json({
      success: true,
      contribution: contributionData,
      initiativeTitle: title
    });
  } catch (err) {
    if (dbConnection) await dbConnection.rollback();
    console.error('API Error /api/checkout/verify-session:', err);
    res.status(500).json({ error: err.message || 'Database error validating pledge.' });
  } finally {
    if (dbConnection) dbConnection.release();
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
