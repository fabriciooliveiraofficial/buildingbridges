import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
      console.log('Seed data inserted successfully.');
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
