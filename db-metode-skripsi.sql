-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table db_metode_topsis.alternative_topsis
CREATE TABLE IF NOT EXISTS `alternative_topsis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=361 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.alternative_topsis: ~8 rows (approximately)
INSERT INTO `alternative_topsis` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(353, 'QRIS', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(354, 'BI-FAST', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(355, 'Online', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(356, 'e-Wallet', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(357, 'Multibiler', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),db_metode_topsis_peribahasa
	(358, 'SKN', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(359, 'RTGS', '2025-09-08 14:55:17', '2025-09-08 14:55:17'),
	(360, 'Remittance', '2025-09-08 14:55:17', '2025-09-08 14:55:17');

-- Dumping structure for table db_metode_topsis.bobot_topsis
CREATE TABLE IF NOT EXISTS `bobot_topsis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_criteria` int NOT NULL,
  `min_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `max_value` decimal(15,2) DEFAULT NULL,
  `score` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_criteria` (`id_criteria`),
  CONSTRAINT `bobot_topsis_ibfk_1` FOREIGN KEY (`id_criteria`) REFERENCES `criteria_topsis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.bobot_topsis: ~19 rows (approximately)
INSERT INTO `bobot_topsis` (`id`, `id_criteria`, `min_value`, `max_value`, `score`) VALUES
	(6, 2, 0.00, 299.00, 1),
	(7, 2, 300.00, 599.00, 2),
	(8, 2, 500.00, 899.00, 3),
	(9, 2, 900.00, 1200.00, 4),
	(10, 2, 1201.00, 999999.00, 5),
	(11, 1, 0.00, 399.00, 1),
	(12, 1, 400.00, 799.00, 2),
	(13, 1, 800.00, 1199.00, 3),
	(14, 1, 1200.00, 1600.00, 4),
	(15, 1, 1601.00, 9999999.00, 5),
	(16, 3, 0.00, 249999.00, 1),
	(17, 3, 250000.00, 499999.00, 2),
	(18, 3, 500000.00, 749999.00, 3),
	(19, 3, 750000.00, 999999.00, 4),
	(20, 3, 1000000.00, 9999999999999.00, 5),
	(27, 9, 0.00, 999.00, 5),
	(28, 9, 1000.00, 2000.00, 4),
	(31, 9, 2001.00, 3000.00, 3),
	(32, 9, 3001.00, 4000.00, 2),
	(33, 9, 4001.00, 99999999999.00, 1);

-- Dumping structure for table db_metode_topsis.criteria_topsis
CREATE TABLE IF NOT EXISTS `criteria_topsis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `weight` float NOT NULL,
  `attribute` enum('benefit','cost') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.criteria_topsis: ~4 rows (approximately)
INSERT INTO `criteria_topsis` (`id`, `name`, `weight`, `attribute`) VALUES
	(1, 'frekuensi penggunaan', 5, 'benefit'),
	(2, 'jumlah pengguna', 5, 'benefit'),
	(3, 'rata-rata nominal transaksi', 5, 'benefit'),
	(9, 'rata rata biaya transaksi', 5, 'cost');

-- Dumping structure for table db_metode_topsis.results_topsis
CREATE TABLE IF NOT EXISTS `results_topsis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alternative_id` int NOT NULL,
  `total_score` float NOT NULL,
  `ranking` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `alternative_id` (`alternative_id`),
  CONSTRAINT `results_ibfk_1` FOREIGN KEY (`alternative_id`) REFERENCES `alternative_topsis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2514 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.results_topsis: ~8 rows (approximately)
INSERT INTO `results_topsis` (`id`, `alternative_id`, `total_score`, `ranking`, `created_at`, `updated_at`) VALUES
	(2506, 355, 0.8783, 1, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2507, 354, 0.771, 2, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2508, 356, 0.5873, 3, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2509, 353, 0.5092, 4, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2510, 359, 0.4908, 5, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2511, 358, 0.4049, 6, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2512, 360, 0.335, 7, '2025-09-08 14:55:54', '2025-09-08 14:55:54'),
	(2513, 357, 0.2986, 8, '2025-09-08 14:55:55', '2025-09-08 14:55:55');

-- Dumping structure for table db_metode_topsis.scores_topsis
CREATE TABLE IF NOT EXISTS `scores_topsis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alternative_id` int DEFAULT NULL,
  `criteria_id` int DEFAULT NULL,
  `value` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tgl_transaksi` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alternative_id` (`alternative_id`),
  KEY `criteria_id` (`criteria_id`),
  CONSTRAINT `scores_topsis_ibfk_1` FOREIGN KEY (`alternative_id`) REFERENCES `alternative_topsis` (`id`),
  CONSTRAINT `scores_topsis_ibfk_2` FOREIGN KEY (`criteria_id`) REFERENCES `criteria_topsis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1441 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.scores_topsis: ~32 rows (approximately)
INSERT INTO `scores_topsis` (`id`, `alternative_id`, `criteria_id`, `value`, `created_at`, `updated_at`, `tgl_transaksi`) VALUES
	(1409, 353, 1, 10712, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1410, 353, 2, 1367, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1411, 353, 3, 137607, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1412, 353, 9, 0, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1413, 354, 1, 13581, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1414, 354, 2, 3465, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1415, 354, 3, 7211250, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1416, 354, 9, 2500, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1417, 355, 1, 3111, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1418, 355, 2, 911, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1419, 355, 3, 4715340, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1420, 355, 9, 6465.64, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1421, 356, 1, 6206, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1422, 356, 2, 1462, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1423, 356, 3, 352711, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1424, 356, 9, 1209.39, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1425, 357, 1, 606, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1426, 357, 2, 358, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1427, 357, 3, 183941, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1428, 357, 9, 2149.75, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1429, 358, 1, 56, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1430, 358, 2, 39, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1431, 358, 3, 171723000, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1432, 358, 9, 2900, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1433, 359, 1, 33, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1434, 359, 2, 24, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1435, 359, 3, 563648000, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1436, 359, 9, 30000, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1437, 360, 1, 104, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1438, 360, 2, 78, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1439, 360, 3, 87978900, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL),
	(1440, 360, 9, 0, '2025-09-08 14:55:17', '2025-09-08 14:55:17', NULL);

	-- Dumping structure for table db_metode_topsis.users
	CREATE TABLE IF NOT EXISTS `users` (
	  `id` int NOT NULL AUTO_INCREMENT,
	  `username` varchar(100) NOT NULL,
	  `telepon` varchar(100) NOT NULL,
	  `email` varchar(100) DEFAULT NULL,
	  `password` varchar(255) NOT NULL,
	  `role` enum('User1','User2','User3','User4','User5','Admin') DEFAULT NULL,
	  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_metode_topsis.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `username`, `telepon`, `email`, `password`, `role`, `created_at`) VALUES
	(3, 'Ari', '08568224774', 'arikurniawan@gmail.com', '$2b$10$zHpUDtBBiOZLm6f7S/xFOeUTfzAo45HIwpzlRWgd/Nau4Jwvs3ok.', 'User2', '2025-07-26 09:19:46'),
	(7, 'Admin', '08568224774', 'admin@gmail.com', '$2b$10$Ur4PtVOQA481LGqCrD/0oOq3noU9UOJSA4BtkjBjb5aBKO/LFpafC', 'Admin', '2025-09-08 13:45:28'),
	(8, 'Admin', '081270347342', 'admin@gmail.com', '$2b$10$75fpg7jN2fUiVsLGK0ej8es70ER28mo.BpOaOs2jvgzqyI0HjJghu', NULL, '2025-09-10 11:20:32');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
db_metode_topsis_peribahasadb_metode_topsis_peribahasadb_metode_topsis_peribahasadb_metode_ahp_infra