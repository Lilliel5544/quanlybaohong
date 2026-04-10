-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 07, 2026 lúc 06:18 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nghiên cứu xây dựng ứng dụng quản lý báo hỏng và khắc phục các s`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `equipment_status_history`
--

CREATE TABLE `equipment_status_history` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `status` enum('Chờ tiếp nhận','Đang sửa','Thiếu linh kiện','Đang chờ linh kiện','Đã sửa xong','Không thể sửa') NOT NULL,
  `note` text DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lecture_hall`
--

CREATE TABLE `lecture_hall` (
  `id` int(11) NOT NULL,
  `hall_name` varchar(50) NOT NULL,
  `block` varchar(20) NOT NULL,
  `floor` int(11) DEFAULT NULL,
  `campus` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `maintenance_log`
--

CREATE TABLE `maintenance_log` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `technician_id` int(11) NOT NULL,
  `repair_action` text DEFAULT NULL,
  `completion_image` varchar(255) DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `maintenance_ticket`
--

CREATE TABLE `maintenance_ticket` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `hall_id` int(11) NOT NULL,
  `technician_id` int(11) DEFAULT NULL,
  `equipment_type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `image_proof` varchar(255) DEFAULT NULL,
  `status` enum('Chờ tiếp nhận','Đang xử lý','Đã sửa xong','Từ chối') DEFAULT 'Chờ tiếp nhận',
  `priority` enum('Thấp','Trung bình','Cao','Khẩn cấp') DEFAULT 'Trung bình',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_profile`
--

CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('Giảng viên','Sinh viên','Kỹ thuật viên','Admin') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `phone_no` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `equipment_status_history`
--
ALTER TABLE `equipment_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Chỉ mục cho bảng `lecture_hall`
--
ALTER TABLE `lecture_hall`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `maintenance_log`
--
ALTER TABLE `maintenance_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `fk_technician` (`technician_id`);

--
-- Chỉ mục cho bảng `maintenance_ticket`
--
ALTER TABLE `maintenance_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hall_id` (`hall_id`),
  ADD KEY `fk_reporter` (`reporter_id`),
  ADD KEY `fk_ticket_technician` (`technician_id`);

--
-- Chỉ mục cho bảng `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `equipment_status_history`
--
ALTER TABLE `equipment_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lecture_hall`
--
ALTER TABLE `lecture_hall`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `maintenance_log`
--
ALTER TABLE `maintenance_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `maintenance_ticket`
--
ALTER TABLE `maintenance_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `equipment_status_history`
--
ALTER TABLE `equipment_status_history`
  ADD CONSTRAINT `equipment_status_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `maintenance_ticket` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `maintenance_log`
--
ALTER TABLE `maintenance_log`
  ADD CONSTRAINT `fk_technician` FOREIGN KEY (`technician_id`) REFERENCES `user_profile` (`id`),
  ADD CONSTRAINT `maintenance_log_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `maintenance_ticket` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `maintenance_ticket`
--
ALTER TABLE `maintenance_ticket`
  ADD CONSTRAINT `fk_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `user_profile` (`id`),
  ADD CONSTRAINT `fk_ticket_technician` FOREIGN KEY (`technician_id`) REFERENCES `user_profile` (`id`),
  ADD CONSTRAINT `maintenance_ticket_ibfk_1` FOREIGN KEY (`hall_id`) REFERENCES `lecture_hall` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
