-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 12, 2026 at 05:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aquavenue`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('aquavenue_cache_kholiqi@gmail.com|127.0.0.1', 'i:1;', 1768051297),
('aquavenue_cache_kholiqi@gmail.com|127.0.0.1:timer', 'i:1768051297;', 1768051297),
('aquavenue_cache_sdn2@gmail.com|127.0.0.1', 'i:1;', 1768051269),
('aquavenue_cache_sdn2@gmail.com|127.0.0.1:timer', 'i:1768051269;', 1768051269),
('aquavenue_cache_wanah@gmail.com|127.0.0.1', 'i:1;', 1768051320),
('aquavenue_cache_wanah@gmail.com|127.0.0.1:timer', 'i:1768051320;', 1768051320),
('pandanwangi_cache_noraulia03r@gmail.com|127.0.0.1', 'i:2;', 1767152073),
('pandanwangi_cache_noraulia03r@gmail.com|127.0.0.1:timer', 'i:1767152073;', 1767152073);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `facility_price` int(11) NOT NULL,
  `facility_description` text NOT NULL,
  `facility_image` varchar(255) DEFAULT NULL,
  `facility_type` enum('rent','sell') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `facility_name`, `facility_price`, `facility_description`, `facility_image`, `facility_type`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Gazebo', 50000, 'Gazebo nyaman untuk bersantai.', NULL, 'rent', '2025-12-23 15:39:58', '2025-12-23 15:39:58', NULL),
(2, 'Kacamata Renang', 80000, 'Kacamata renang anti-fog untuk anak & dewasa.', NULL, 'sell', '2025-12-23 15:39:58', '2025-12-23 16:54:04', NULL),
(4, 'Pelampung', 10000, 'Pelampung anak dan dewasa.', NULL, 'rent', '2025-12-23 15:39:58', '2025-12-23 16:50:51', NULL),
(5, 'Handuk', 10000, 'Jual handuk bersih dan wangi.', NULL, 'sell', '2025-12-23 15:39:58', '2025-12-31 02:40:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `facility_stock_ins`
--

CREATE TABLE `facility_stock_ins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `stock` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `facility_stock_ins`
--

INSERT INTO `facility_stock_ins` (`id`, `facility_id`, `stock`, `created_at`, `updated_at`) VALUES
(1, 1, 6, '2025-12-23 15:39:58', '2025-12-23 15:39:58'),
(2, 2, 20, '2025-12-23 15:39:58', '2025-12-23 15:39:58'),
(4, 4, 30, '2025-12-23 15:39:58', '2025-12-23 15:39:58'),
(5, 5, 25, '2025-12-23 15:39:58', '2025-12-23 15:39:58'),
(11, 4, -10, '2025-12-23 16:55:43', '2025-12-23 16:55:43'),
(12, 4, 0, '2025-12-23 16:55:49', '2025-12-23 16:55:49'),
(13, 4, 0, '2025-12-23 16:55:54', '2025-12-23 16:55:54'),
(14, 4, 0, '2025-12-23 16:56:00', '2025-12-23 16:56:00'),
(15, 4, 0, '2025-12-23 16:56:04', '2025-12-23 16:56:04');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_26_100418_add_two_factor_columns_to_users_table', 1),
(5, '2025_09_30_184042_add_role_to_users_table', 1),
(6, '2025_09_30_191017_create_facilities_table', 1),
(7, '2025_09_30_220745_create_facility_stock_ins_table', 1),
(8, '2025_09_30_224005_create_orders_table', 1),
(9, '2025_09_30_224010_create_order_details_table', 1),
(10, '2025_10_05_105615_create_pools_table', 1),
(11, '2025_10_05_121036_add_image_to_users_table', 1),
(12, '2025_10_05_134813_soft_delete_facility', 1),
(13, '2025_10_05_154918_soft_delete_users', 1),
(14, '2025_10_06_032538_add_check_in_out_time_to_orders_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `tax` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `pool_price` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `date` date NOT NULL,
  `midtrans_snap_token` varchar(255) NOT NULL,
  `midtrans_redirect_url` varchar(255) NOT NULL,
  `check_in_at` datetime DEFAULT NULL,
  `check_out_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `status`, `tax`, `subtotal`, `total`, `pool_price`, `amount`, `time`, `date`, `midtrans_snap_token`, `midtrans_redirect_url`, `check_in_at`, `check_out_at`, `created_at`, `updated_at`) VALUES
('03e06dc6-3422-40d9-b238-acf5a645768b', 6, 'confirmed', 23000, 230000, 253000, 15000, 10, 9, '2025-12-31', '21c5016d-99ab-446a-aa0a-c65fa8175bdb', 'https://app.sandbox.midtrans.com/snap/v4/redirection/21c5016d-99ab-446a-aa0a-c65fa8175bdb', '2025-12-31 09:43:26', NULL, '2025-12-31 02:38:14', '2025-12-31 02:43:26'),
('054389bb-20c2-4e84-973a-e8b9b0ef641c', 3, 'confirmed', 1500, 15000, 16500, 15000, 1, 10, '2025-12-31', 'd35dfeab-46ca-48a8-8c18-5a3ccce2361e', 'https://app.sandbox.midtrans.com/snap/v4/redirection/d35dfeab-46ca-48a8-8c18-5a3ccce2361e', '2025-12-31 10:39:24', NULL, '2025-12-31 03:35:16', '2025-12-31 03:39:24'),
('4d8cbaf7-4ced-4937-a3a9-7f5ea49dd04b', 8, 'confirmed', 70000, 700000, 770000, 15000, 30, 13, '2026-01-05', '71346aa0-f45d-40f1-a478-fc2747122a04', 'https://app.sandbox.midtrans.com/snap/v4/redirection/71346aa0-f45d-40f1-a478-fc2747122a04', '2026-01-05 13:18:37', '2026-01-05 14:20:11', '2026-01-05 06:15:56', '2026-01-05 07:20:11'),
('4df3d6d0-6fb4-4b08-97a2-f24f4c349349', 7, 'confirmed', 5000, 50000, 55000, 15000, 2, 9, '2026-01-05', '4bf4d7ed-2203-4f30-a322-70d5fc63b9c6', 'https://app.sandbox.midtrans.com/snap/v4/redirection/4bf4d7ed-2203-4f30-a322-70d5fc63b9c6', '2026-01-05 09:41:11', '2026-01-05 13:08:07', '2026-01-05 02:38:55', '2026-01-05 06:08:07'),
('597c92bd-8803-405f-b91b-6175ab03069f', 5, 'confirmed', 14500, 145000, 159500, 15000, 5, 10, '2025-12-25', 'd92944ab-b4ff-40b5-81f7-f51a59036fdc', 'https://app.sandbox.midtrans.com/snap/v4/redirection/d92944ab-b4ff-40b5-81f7-f51a59036fdc', '2025-12-25 10:09:10', NULL, '2025-12-25 03:03:10', '2025-12-25 03:09:10'),
('5dffa4da-d856-4459-8bf4-9fea40b5b2c2', 4, 'confirmed', 7500, 75000, 82500, 15000, 5, 9, '2025-12-24', 'f954a738-0eeb-4d45-acef-7ef9fc065fdb', 'https://app.sandbox.midtrans.com/snap/v4/redirection/f954a738-0eeb-4d45-acef-7ef9fc065fdb', NULL, NULL, '2025-12-23 17:10:33', '2025-12-23 17:14:29'),
('80883fa2-d4a8-42c6-bf64-41eb2e3c33d5', 3, 'pending', 10000, 100000, 110000, 100000, 1, 8, '2025-12-24', '48eafef6-711f-463d-8f04-ab8091247e6a', 'https://app.sandbox.midtrans.com/snap/v4/redirection/48eafef6-711f-463d-8f04-ab8091247e6a', NULL, NULL, '2025-12-23 16:40:40', '2025-12-23 16:40:40'),
('810448d5-341f-457a-a2cc-11ad4b9f47de', 7, 'confirmed', 14500, 145000, 159500, 15000, 5, 8, '2026-01-05', '1ca054ca-8012-492e-8851-25bb483288bb', 'https://app.sandbox.midtrans.com/snap/v4/redirection/1ca054ca-8012-492e-8851-25bb483288bb', NULL, NULL, '2026-01-04 18:47:52', '2026-01-04 18:49:31'),
('8eeff35d-a078-46ce-89e1-4e95e2bd2d13', 3, 'confirmed', 11000, 110000, 121000, 15000, 6, 13, '2026-01-11', '4a37ca0f-20d0-467f-ac7d-3a60ff3604eb', 'https://app.sandbox.midtrans.com/snap/v4/redirection/4a37ca0f-20d0-467f-ac7d-3a60ff3604eb', NULL, NULL, '2026-01-11 06:52:06', '2026-01-11 06:54:52'),
('9deacbe8-115b-4b2a-9a0f-bab2cf1e9f34', 10, 'pending', 15000, 150000, 165000, 15000, 10, 9, '2026-01-11', 'f2748b46-a61e-49f3-9d2b-34761ad03fc9', 'https://app.sandbox.midtrans.com/snap/v4/redirection/f2748b46-a61e-49f3-9d2b-34761ad03fc9', NULL, NULL, '2026-01-10 13:23:46', '2026-01-10 13:23:46'),
('9fb4c49e-32e9-45c5-a0ef-cee1acb3d7bf', 3, 'pending', 5500, 55000, 60500, 15000, 3, 13, '2026-01-11', '4adb27df-cee7-448d-be17-93a178b5959e', 'https://app.sandbox.midtrans.com/snap/v4/redirection/4adb27df-cee7-448d-be17-93a178b5959e', NULL, NULL, '2026-01-11 06:25:44', '2026-01-11 06:25:44'),
('c94a4659-7959-489e-a6ee-3f6859845dcf', 10, 'confirmed', 7500, 75000, 82500, 15000, 1, 10, '2026-01-11', '55bd4100-66e0-4a9c-a330-c57c8591f457', 'https://app.sandbox.midtrans.com/snap/v4/redirection/55bd4100-66e0-4a9c-a330-c57c8591f457', NULL, NULL, '2026-01-10 16:22:26', '2026-01-10 16:25:21'),
('e1e26a5f-7c23-4b19-a2dc-68fa95dcdd6c', 9, 'confirmed', 6000, 60000, 66000, 15000, 4, 8, '2026-01-11', '0105ec44-3864-4acb-b74d-b42ba0836b9f', 'https://app.sandbox.midtrans.com/snap/v4/redirection/0105ec44-3864-4acb-b74d-b42ba0836b9f', NULL, NULL, '2026-01-10 12:45:46', '2026-01-10 12:47:20'),
('e862d51f-caaa-4272-a12c-06e556cc0a96', 10, 'confirmed', 15000, 150000, 165000, 15000, 10, 9, '2026-01-11', '8c3d1d41-a3b5-46f9-9275-de9144c728d8', 'https://app.sandbox.midtrans.com/snap/v4/redirection/8c3d1d41-a3b5-46f9-9275-de9144c728d8', NULL, NULL, '2026-01-10 13:23:48', '2026-01-10 13:25:39');

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `facility_id`, `quantity`, `price`, `total`, `created_at`, `updated_at`) VALUES
('20aa26c8-ced5-4eea-b6a4-cb58271c8445', 'c94a4659-7959-489e-a6ee-3f6859845dcf', 1, 1, 50000, 50000, '2026-01-10 16:22:26', '2026-01-10 16:22:26'),
('34271daf-38fe-4d09-a787-414d57a1d497', '597c92bd-8803-405f-b91b-6175ab03069f', 4, 2, 10000, 20000, '2025-12-25 03:03:10', '2025-12-25 03:03:10'),
('362a1596-9fa8-4b6a-a502-9bb2bfcf87b6', 'c94a4659-7959-489e-a6ee-3f6859845dcf', 4, 1, 10000, 10000, '2026-01-10 16:22:26', '2026-01-10 16:22:26'),
('41c46170-029d-4750-bc46-ed6e7aac05a0', '810448d5-341f-457a-a2cc-11ad4b9f47de', 4, 2, 10000, 20000, '2026-01-04 18:47:52', '2026-01-04 18:47:52'),
('574d1457-9c6e-4a84-a12e-616f85fcf9be', '9fb4c49e-32e9-45c5-a0ef-cee1acb3d7bf', 4, 1, 10000, 10000, '2026-01-11 06:25:44', '2026-01-11 06:25:44'),
('6ac001ee-8757-4070-812c-add4957fc70d', '03e06dc6-3422-40d9-b238-acf5a645768b', 4, 3, 10000, 30000, '2025-12-31 02:38:14', '2025-12-31 02:38:14'),
('78309974-dd92-4051-bd05-7bc1f52f2b04', '03e06dc6-3422-40d9-b238-acf5a645768b', 1, 1, 50000, 50000, '2025-12-31 02:38:14', '2025-12-31 02:38:14'),
('8266d188-55b8-4fe3-9aca-ca08c8e041b5', '8eeff35d-a078-46ce-89e1-4e95e2bd2d13', 4, 2, 10000, 20000, '2026-01-11 06:52:06', '2026-01-11 06:52:06'),
('88186e92-3691-4a77-84ce-247510d73337', '4df3d6d0-6fb4-4b08-97a2-f24f4c349349', 4, 2, 10000, 20000, '2026-01-05 02:38:55', '2026-01-05 02:38:55'),
('88ffe0f4-721c-4b7a-8c97-8744fce9e57d', '4d8cbaf7-4ced-4937-a3a9-7f5ea49dd04b', 1, 2, 50000, 100000, '2026-01-05 06:15:56', '2026-01-05 06:15:56'),
('cc0c6ff6-4bed-4baf-8e1f-b2baa2d4d2ab', '4d8cbaf7-4ced-4937-a3a9-7f5ea49dd04b', 5, 5, 10000, 50000, '2026-01-05 06:15:56', '2026-01-05 06:15:56'),
('e530cdbb-cca4-4120-b1d5-902e6a75ea5a', '597c92bd-8803-405f-b91b-6175ab03069f', 1, 1, 50000, 50000, '2025-12-25 03:03:10', '2025-12-25 03:03:10'),
('ed15c869-f2d1-4413-bf51-7f85b2181d66', '4d8cbaf7-4ced-4937-a3a9-7f5ea49dd04b', 4, 10, 10000, 100000, '2026-01-05 06:15:56', '2026-01-05 06:15:56'),
('f39fa43d-9e83-4870-a199-40f4ca3ae8f3', '810448d5-341f-457a-a2cc-11ad4b9f47de', 1, 1, 50000, 50000, '2026-01-04 18:47:52', '2026-01-04 18:47:52');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('norauliar03@gmail.com', '$2y$12$hEUofDSnCuA2mkPGueEsAurWFATQUlLU8V2kZ1OGRdCEzSL/h2HH6', '2026-01-11 06:20:15');

-- --------------------------------------------------------

--
-- Table structure for table `pools`
--

CREATE TABLE `pools` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `capacity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `price` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pools`
--

INSERT INTO `pools` (`id`, `capacity`, `price`, `created_at`, `updated_at`) VALUES
(1, 90, 15000, '2025-12-23 15:39:58', '2025-12-23 16:46:28');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('KeHKi9RkD4C2KVDMaz10JRw7P1BJtmqOrJrg1jvT', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTXBPNmFuNWFLSDl3NDcyRWpIcno1MDZvZ0twa3JMbHBheFpKSVpFbSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czoxMDI6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYXNoYm9hcmQvZGF0YT9mcm9tPTIwMjYtMDEtMTFUMDclM0EyMCUzQTQzLjMzNFomdG89MjAyNi0wMS0xMVQwNyUzQTIwJTNBNDMuMzM0WiI7fX0=', 1768116044),
('M6UUtbg0v2x2G8OaXG6j5ERyIFVnfD2AtRhfxvdD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1hlOTZpTXF2WG9teUlRVEJSVVcyWnRtNXNZaXQ0TDlwN0F3TFo4OSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768221421),
('McwLEk2TYR0phXU0vEx9prsTUIGcius2EOTST4Zo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWXlOS2NWTjRiRDB5VGd4a3NjZFNNWnlCNlNNTE9BVlZxaGRpYU9CMSI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2Rhc2hib2FyZCI7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768124773),
('pjia14hG9YSutk0QwNuXS3WIbpFs0KecC1rWuT6k', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWGhPbGZrOTZwZlpEYjFlRUtCcWUxcUVObmw3Q1N4aGlxU0xEUmoydiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1768235515),
('R2SxXFScqfLfNXV57DE5omNV1PwwojS4nDkPcY7I', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMkNFdXFTVnFZYzcwWVFacmM3Z1h6VG5KZXgzenVSazl2VUZrQzFIUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768221419);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','user') NOT NULL DEFAULT 'user',
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `image`, `email_verified_at`, `password`, `role`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Super Admin', 'noraulia03@gmail.com', NULL, '2025-12-23 15:39:57', '$2y$12$W0zOsYBKKqrGKzc8PCyW3.0rL8LAeLX.jDQBxEpPPL3uP/7p2e6mu', 'superadmin', NULL, NULL, NULL, NULL, '2025-12-23 15:39:57', '2025-12-23 15:39:57', NULL),
(2, 'Admin', 'norauliaaa@gmail.com', NULL, '2025-12-23 15:39:57', '$2y$12$LaKVEXogps3eA42PqWl8D.Fy/jD8N4tVdmKf0FOrDyYmi8M0lq/Da', 'admin', NULL, NULL, NULL, NULL, '2025-12-23 15:39:57', '2025-12-23 15:39:57', NULL),
(3, 'User', 'norauliar03@gmail.com', NULL, '2025-12-23 15:39:58', '$2y$12$2q2C1zyrAvEU4KQOktC0b.eiG3HhevggLuuDXEJf28Tzcs4DAnvw2', 'user', NULL, NULL, NULL, NULL, '2025-12-23 15:39:58', '2025-12-23 15:39:58', NULL),
(4, 'Anggun', 'anggunpranesti@gmail.com', NULL, NULL, '$2y$12$bxWHGgPXi1caUIjSqEPmB.In1pYTM/Avni3.Nv2m1HgIzGM3kP6Lm', 'user', NULL, NULL, NULL, NULL, '2025-12-23 17:09:21', '2025-12-23 17:09:21', NULL),
(5, 'Rika', 'rikarika@gmail.com', NULL, NULL, '$2y$12$b6reOfGeXcBgVQdSyTNXq.gwOBxWZbzZLs9tf/5K5rJZbhEvs9qvO', 'user', NULL, NULL, NULL, NULL, '2025-12-25 03:02:00', '2025-12-25 03:02:00', NULL),
(6, 'Aini', 'ainirum@gmail.com', NULL, NULL, '$2y$12$52R8FP1KO46fdsPyYBX2NOpMUKVNaC0qMMHwjMl5asG7coE5qCQ8a', 'user', NULL, NULL, NULL, NULL, '2025-12-31 02:21:22', '2025-12-31 02:21:22', NULL),
(7, 'Adri', 'kholiqi27@gmail.com', NULL, NULL, '$2y$12$UBVKc7SgnahPFdMccGIvSuRUiQX0.kU1G8Km7MO3ycp8fSNO6gr3O', 'user', NULL, NULL, NULL, NULL, '2026-01-04 18:46:50', '2026-01-04 18:46:50', NULL),
(8, 'SD N 2 Sarigadung', 'sdn2srgd@gmail.com', NULL, NULL, '$2y$12$oFNVsLy74KcJGLYxNnR0nu7OHDKffhj1lFYWU3TsLUim2.lZELglu', 'user', NULL, NULL, NULL, NULL, '2026-01-05 06:14:36', '2026-01-05 06:14:36', NULL),
(9, 'Ikan', 'ikan99@gmail.com', NULL, NULL, '$2y$12$REC1mbm4zR6fzoQhu1JHHuH7swHiKjFmS9jODRrqcF8Vi4A967xgy', 'user', NULL, NULL, NULL, NULL, '2026-01-10 12:44:29', '2026-01-10 12:44:29', NULL),
(10, 'kira', 'kira34@gmail.com', NULL, NULL, '$2y$12$ACOwZkMR22YApnATjzzE9eIxRVFxOmSyel2VSUpFhI4HXEZAlSlve', 'user', NULL, NULL, NULL, NULL, '2026-01-10 13:21:26', '2026-01-10 13:21:26', NULL),
(11, 'Lifeguard', 'hayuaini@gmail.com', NULL, NULL, '$2y$12$kAU7iVQqz6oOsbbA5MAHb.PX37cDHj6agmvPSEsSk8JQ9pqOlbqxe', 'admin', NULL, NULL, NULL, NULL, '2026-01-10 13:37:09', '2026-01-10 13:37:09', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facilities_facility_type_index` (`facility_type`);

--
-- Indexes for table `facility_stock_ins`
--
ALTER TABLE `facility_stock_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facility_stock_ins_facility_id_created_at_index` (`facility_id`,`created_at`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `orders_status_index` (`status`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_details_order_id_facility_id_unique` (`order_id`,`facility_id`),
  ADD KEY `order_details_facility_id_foreign` (`facility_id`),
  ADD KEY `order_details_order_id_facility_id_index` (`order_id`,`facility_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `pools`
--
ALTER TABLE `pools`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_index` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `facility_stock_ins`
--
ALTER TABLE `facility_stock_ins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `pools`
--
ALTER TABLE `pools`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `facility_stock_ins`
--
ALTER TABLE `facility_stock_ins`
  ADD CONSTRAINT `facility_stock_ins_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_details_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
