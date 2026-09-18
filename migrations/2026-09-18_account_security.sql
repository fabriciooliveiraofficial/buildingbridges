-- =====================================================================
-- Migration: account security (recovery e-mail + password reset links)
-- Date: 2026-09-18
--
-- HOW TO RUN IN phpMyAdmin
--   1. Click the site's database in the left panel (e.g. building_bridges).
--   2. Open the "SQL" tab, paste this whole file and click "Go".
--
-- Safe to run more than once: it only creates what is missing.
-- (The Node server also applies this automatically on start-up; running it
--  here is only needed if you prefer to migrate the database by hand.)
-- =====================================================================

-- 1) users.recovery_email  (second address that also receives reset links)
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'recovery_email'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `recovery_email` VARCHAR(255) NULL AFTER `email`',
  'SELECT ''users.recovery_email already exists - nothing to do'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) password_resets  (one-time reset links; only the SHA-256 of the token is stored)
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_token_hash (`token_hash`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ROLLBACK (only if you ever need to undo this migration - it deletes data):
--   DROP TABLE IF EXISTS `password_resets`;
--   ALTER TABLE `users` DROP COLUMN `recovery_email`;
-- =====================================================================
