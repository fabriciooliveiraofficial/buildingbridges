import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

async function migrateTable(pool, tableName, idColumn, imageColumn) {
    console.log(`Migrating ${tableName}...`);
    const [rows] = await pool.query(`SELECT ${idColumn}, ${imageColumn} FROM ${tableName} WHERE ${imageColumn} LIKE 'data:image/%'`);
    
    console.log(`Found ${rows.length} rows with base64 images in ${tableName}.`);
    
    for (const row of rows) {
        const base64DataUri = row[imageColumn];
        const matches = base64DataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            console.log(`Skipping row ${row[idColumn]} - Invalid base64 data URI format.`);
            continue;
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1] || 'jpg';
        
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${tableName}-${row[idColumn]}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, buffer);
        
        const publicUrl = `/uploads/${filename}`;
        
        await pool.query(`UPDATE ${tableName} SET ${imageColumn} = ? WHERE ${idColumn} = ?`, [publicUrl, row[idColumn]]);
        console.log(`Migrated row ${row[idColumn]} to ${publicUrl}`);
    }
}

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'building_bridges',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        await migrateTable(pool, 'projects', 'id', 'image_url');
        await migrateTable(pool, 'initiatives', 'id', 'image_url');
        await migrateTable(pool, 'products', 'id', 'image_url');
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await pool.end();
    }
}

main();
