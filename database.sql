-- SQL Script for Building Bridges MySQL Database
-- Compatible with Hostinger MySQL (and local environment)

CREATE DATABASE IF NOT EXISTS `building_bridges` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `building_bridges`;

-- Table structure for `projects`
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `goal_amount` DECIMAL(15, 2) NOT NULL,
  `raised_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `image_url` VARCHAR(512) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `category` VARCHAR(100) NULL,
  `long_description` TEXT NULL,
  `budget_json` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data (Fallback Missions)
INSERT INTO `projects` (`id`, `name`, `description`, `goal_amount`, `raised_amount`, `image_url`, `status`, `category`, `long_description`, `budget_json`)
VALUES 
(
  'rio-grande', 
  'Rio Grande do Sul Relief', 
  'Support the long-term rebuilding efforts of local community centers, schools, and homes affected by historical floods in Southern Brazil.', 
  500000.00, 
  375000.00, 
  'https://picsum.photos/seed/rio/800/600', 
  'active', 
  'BRAZIL RELIEF', 
  'The historic floods in Rio Grande do Sul have displaced hundreds of thousands of families and destroyed vital community infrastructure. Our response focus is long-term sustainable recovery: rebuilding neighborhood community centers to serve as emergency shelters, constructing climate-resilient houses in safe elevations, and restoring community gardens to ensure local food sovereignty.', 
  '[{"label": "Reconstruction", "percent": 65}, {"label": "Community Center Rebuilding", "percent": 20}, {"label": "Emergency Supplies", "percent": 10}, {"label": "Logistics", "percent": 5}]'
),
(
  'gulf-coast', 
  'Gulf Coast Resilience', 
  'Equip regional coastal community hubs with resilient emergency solar infrastructure and clean water backup generators.', 
  750000.00, 
  315000.00, 
  'https://picsum.photos/seed/gulf/800/600', 
  'active', 
  'USA RESILIENCE', 
  'Coastal towns along the Gulf Coast are increasingly vulnerable to high-intensity hurricanes and subsequent power outages. This resilience initiative aims to fully solar-equip and secure 12 vital community shelters with off-grid battery arrays, backup clean water reverse-osmosis filtration systems, and localized satellite emergency communication nodes.', 
  '[{"label": "Solar Infrastructure", "percent": 55}, {"label": "Water Purification", "percent": 25}, {"label": "Emergency Telecom", "percent": 12}, {"label": "Hub Preparation", "percent": 8}]'
),
(
  'amazon-basin', 
  'Amazon Basin Canopy Restoration', 
  'Finance native seed collection, tree planting nurseries, and traditional agricultural training with 45 indigenous communities in Brazil.', 
  300000.00, 
  273000.00, 
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop', 
  'active', 
  'AMAZON RELIEF', 
  'In the heart of the Xingu Basin, traditional ways of life are under threat from both climate change and rapid deforestation. Our mission is two-fold: restoring 500 hectares of native canopy and providing climate-resilient, sustainable housing for 45 indigenous families.', 
  '[{"label": "Construction", "percent": 60}, {"label": "Reforestation", "percent": 25}, {"label": "Training", "percent": 10}, {"label": "Logistics", "percent": 5}]'
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
