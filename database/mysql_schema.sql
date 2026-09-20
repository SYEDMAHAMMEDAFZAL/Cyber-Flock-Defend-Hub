-- ========================================================================
-- CYBER FLOCK DEFENSE HUB - OFFICIAL MySQL 8.0 / MariaDB SCHEMA DDL
-- Platform: Enterprise Cybersecurity Risk Quantification & Defense Hub
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `cyber_flock` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `cyber_flock`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS `plans` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) UNIQUE NOT NULL,
  `monthly_price` DECIMAL(12, 2) NOT NULL DEFAULT 1999.00,
  `annual_price` DECIMAL(12, 2) NOT NULL DEFAULT 19990.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `max_endpoints` INT NOT NULL DEFAULT 500,
  `max_users` INT NOT NULL DEFAULT 10,
  `max_simulations_per_month` INT NOT NULL DEFAULT 50,
  `vulnerability_monitoring` BOOLEAN NOT NULL DEFAULT TRUE,
  `siem_monitoring` BOOLEAN NOT NULL DEFAULT TRUE,
  `attack_simulation` BOOLEAN NOT NULL DEFAULT TRUE,
  `risk_quantification` BOOLEAN NOT NULL DEFAULT TRUE,
  `ale_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `var_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `monte_carlo_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `investment_optimization` BOOLEAN NOT NULL DEFAULT TRUE,
  `audit_reports` BOOLEAN NOT NULL DEFAULT TRUE,
  `blockchain_verification` BOOLEAN NOT NULL DEFAULT TRUE,
  `api_access` BOOLEAN NOT NULL DEFAULT TRUE,
  `advanced_reports` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Organizations / Multi-Tenant Profiles
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `organization_type` VARCHAR(100) NOT NULL DEFAULT 'Enterprise',
  `industry` VARCHAR(100) NOT NULL,
  `size` VARCHAR(50) NOT NULL,
  `number_of_employees` INT NOT NULL DEFAULT 100,
  `number_of_endpoints` INT NOT NULL DEFAULT 250,
  `annual_revenue` DECIMAL(16, 2) NOT NULL DEFAULT 50000000.00,
  `it_budget` DECIMAL(16, 2) NOT NULL DEFAULT 5000000.00,
  `cybersecurity_budget` DECIMAL(16, 2) NOT NULL DEFAULT 1500000.00,
  `critical_applications` TEXT,
  `cloud_provider` VARCHAR(100) DEFAULT 'AWS',
  `existing_siem` VARCHAR(100) DEFAULT 'Splunk Enterprise ES',
  `existing_edr` VARCHAR(100) DEFAULT 'CrowdStrike Falcon',
  `existing_pam` VARCHAR(100) DEFAULT 'CyberArk Vault',
  `compliance_requirements` VARCHAR(255) DEFAULT 'ISO 27001, SOC 2, NIST CSF',
  `is_onboarded` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_simulated` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_id` VARCHAR(36) NOT NULL,
  `plan_id` VARCHAR(36) NOT NULL,
  `status` ENUM('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PAST_DUE') NOT NULL DEFAULT 'ACTIVE',
  `billing_cycle` ENUM('MONTHLY', 'ANNUAL') NOT NULL DEFAULT 'ANNUAL',
  `start_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` DATETIME,
  `current_simulations_used` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users & Authentication
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `hashed_password` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'SECURITY_ANALYST', 'CISO', 'RED_TEAM', 'AUDITOR', 'IT_ADMIN') NOT NULL DEFAULT 'SECURITY_ANALYST',
  `organization_id` VARCHAR(36),
  `job_title` VARCHAR(150),
  `phone` VARCHAR(50),
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_simulated` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Enterprise Assets
CREATE TABLE IF NOT EXISTS `assets` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `asset_type` ENUM('SERVER', 'DATABASE', 'DOMAIN_CONTROLLER', 'PAYMENT_GATEWAY', 'CLOUD_RESOURCE', 'APPLICATION', 'NETWORK_DEVICE', 'WORKSTATION') NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `hostname` VARCHAR(255),
  `criticality` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'HIGH',
  `financial_value` DECIMAL(16, 2) NOT NULL DEFAULT 1000000.00,
  `exposure_factor` FLOAT NOT NULL DEFAULT 0.75,
  `is_internet_facing` BOOLEAN NOT NULL DEFAULT FALSE,
  `location` VARCHAR(100),
  `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  `is_simulated` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Common Vulnerabilities and Exposures (CVEs)
CREATE TABLE IF NOT EXISTS `cves` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `cvss_score` FLOAT NOT NULL,
  `epss_score` FLOAT NOT NULL DEFAULT 0.50,
  `epss_percentile` FLOAT NOT NULL DEFAULT 0.80,
  `cisa_kev` BOOLEAN NOT NULL DEFAULT FALSE,
  `mitre_attack_id` VARCHAR(50),
  `patch_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_simulated` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Vulnerability Instances
CREATE TABLE IF NOT EXISTS `vulnerabilities` (
  `id` VARCHAR(36) PRIMARY KEY,
  `asset_id` VARCHAR(36) NOT NULL,
  `cve_id` VARCHAR(50) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `discovered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE', 'RISK_ACCEPTED') NOT NULL DEFAULT 'OPEN',
  `estimated_financial_loss` DECIMAL(16, 2) NOT NULL DEFAULT 50000.00,
  `is_simulated` BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cve_id`) REFERENCES `cves`(`id`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Attack Simulations
CREATE TABLE IF NOT EXISTS `simulations` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `scenario_type` VARCHAR(100) NOT NULL,
  `target_asset_type` VARCHAR(100) NOT NULL,
  `cve_id` VARCHAR(50),
  `threat_actor` VARCHAR(150) NOT NULL,
  `active_controls` JSON,
  `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
  `probability_of_success` FLOAT NOT NULL DEFAULT 0.50,
  `estimated_financial_loss` DECIMAL(16, 2) NOT NULL DEFAULT 0.00,
  `hash_sha256` VARCHAR(64),
  `blockchain_tx_hash` VARCHAR(66),
  `executed_by` VARCHAR(36),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Reports
CREATE TABLE IF NOT EXISTS `audit_reports` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_id` VARCHAR(36) NOT NULL,
  `report_title` VARCHAR(255) NOT NULL,
  `report_type` VARCHAR(100) NOT NULL DEFAULT 'EXECUTIVE_BOARD_SUMMARY',
  `generated_by` VARCHAR(255) NOT NULL DEFAULT 'S. Md. Afzal (CEO)',
  `file_path` VARCHAR(500),
  `hash_sha256` VARCHAR(64) NOT NULL,
  `blockchain_tx_hash` VARCHAR(66),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Demo Requests
CREATE TABLE IF NOT EXISTS `demo_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `official_email` VARCHAR(255) NOT NULL,
  `organization` VARCHAR(255) NOT NULL,
  `job_role` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50),
  `organization_size` VARCHAR(50) NOT NULL DEFAULT '500-1000',
  `industry` VARCHAR(100) NOT NULL DEFAULT 'Information Technology',
  `number_of_endpoints` INT NOT NULL DEFAULT 250,
  `security_tools_currently_used` TEXT,
  `preferred_demo_date` VARCHAR(50),
  `preferred_demo_time` VARCHAR(50),
  `requirements_message` TEXT,
  `status` ENUM('PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- Schema deployment completed successfully for CYBER FLOCK DEFENSE HUB.
-- ========================================================================
