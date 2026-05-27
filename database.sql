-- ==========================================================
-- UNIFIED SQL DATABASE SCRIPT FOR BUILDING BRIDGES
-- Compatible with Hostinger MySQL & Local Environments
-- Suitable for direct execution in phpMyAdmin
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `building_bridges` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `building_bridges`;

-- ----------------------------------------------------------
-- 1. Table structure for `projects` (Humanitarian Missions)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `goal_amount` DECIMAL(15, 2) NOT NULL,
  `raised_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `image_url` LONGTEXT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `category` VARCHAR(100) NULL,
  `long_description` TEXT NULL,
  `budget_json` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table structure for `initiatives` (Products & Activities)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `initiatives` (
  `id` VARCHAR(255) NOT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL, -- 'item' or 'experience'
  `description` TEXT NOT NULL,
  `suggested_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `impact_description` VARCHAR(255) NOT NULL,
  `image_url` LONGTEXT NULL,
  `goal_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `raised_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `created_by_user` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_initiative_status (`status`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table structure for `users` (NGO Staff / Admins)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_salt` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'staff',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------
-- 4. Table structure for `contributions` (Pledges & Payments)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contributions` (
  `id` VARCHAR(255) NOT NULL,
  `initiative_id` VARCHAR(255) NULL,
  `project_id` VARCHAR(255) NULL,
  `pledge_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'BRL',
  `supporter_name` VARCHAR(255) NOT NULL,
  `supporter_email` VARCHAR(255) NOT NULL,
  `supporter_phone` VARCHAR(255) NOT NULL,
  `gateway` VARCHAR(50) NOT NULL, -- 'stripe' or 'mercadopago'
  `transaction_reference` VARCHAR(255) NOT NULL UNIQUE,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `additional_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_transaction_ref (`transaction_reference`),
  FOREIGN KEY (`initiative_id`) REFERENCES `initiatives`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- SEED DATA SECTION
-- ==========================================================

-- Seed default projects
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


-- Seed default solidarity initiatives
INSERT INTO `initiatives` (`id`, `project_id`, `title`, `type`, `description`, `suggested_price`, `impact_description`, `image_url`, `goal_amount`, `raised_amount`, `status`, `created_by_user`)
VALUES
(
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
),
(
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
),
(
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
),
(
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
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
