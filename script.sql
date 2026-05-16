-- ============================================================
-- MIGRATION SCRIPT: UKK Database Refactor
-- Dari: struktur lama (1 tabel Statuses, Items tanpa Products)
-- Ke  : struktur baru (pisah status, pisah Products & Items)
-- ============================================================

CREATE DATABASE IF NOT EXISTS UKK;
USE UKK;

-- =========================
-- 1. ROLES
-- =========================
CREATE TABLE Roles (
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO Roles (name)
VALUES ('Admin'), ('Petugas'), ('Peminjam');

-- =========================
-- 2. USERS
-- =========================
CREATE TABLE Users (
    id       INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_role  INT NOT NULL,

    FOREIGN KEY (id_role) REFERENCES Roles(id) ON DELETE CASCADE
);

-- =========================
-- 3. RENTAL STATUSES
--    (workflow transaksi)
-- =========================
CREATE TABLE Rental_Statuses (
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO Rental_Statuses (name)
VALUES
('Pending'),
('Approved'),
('Rejected'),
('Cancelled'),
('Completed');

-- =========================
-- 4. ITEM STATUSES
--    (kondisi unit fisik)
-- =========================
CREATE TABLE Item_Statuses (
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO Item_Statuses (name)
VALUES
('Available'),
('Rented'),
('Maintenance'),
('Damaged');

-- =========================
-- 5. CATEGORY
-- =========================
CREATE TABLE Category (
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

-- =========================
-- 6. PRODUCTS
--    (master barang / jenis alat)
-- =========================
CREATE TABLE Products (
    id          INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_category INT NOT NULL,
    name        VARCHAR(255) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_category) REFERENCES Category(id) ON DELETE CASCADE
);

-- =========================
-- 7. ITEMS
--    (unit fisik tiap produk)
-- =========================
CREATE TABLE Items (
    id         INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_product INT NOT NULL,
    unit_code  VARCHAR(50) NOT NULL UNIQUE,  -- contoh: PAP-001, JS-002
    id_status  INT NOT NULL,

    FOREIGN KEY (id_product) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (id_status)  REFERENCES Item_Statuses(id) ON DELETE CASCADE
);

-- =========================
-- 8. RENTAL
-- =========================
CREATE TABLE Rental (
    id            INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_petugas    INT NOT NULL,
    id_peminjam   INT NOT NULL,
    date_rent     DATETIME NOT NULL,
    date_due      DATETIME NOT NULL,        -- tanggal rencana kembali
    date_returned DATETIME,                 -- NULL sampai barang dikembalikan
    id_status     INT NOT NULL,
    total_price   DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_petugas)  REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_peminjam) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_status)   REFERENCES Rental_Statuses(id) ON DELETE CASCADE
);

-- NOTE: "Late" tidak disimpan sebagai status.
-- Cukup cek: date_returned > date_due (atau NOW() > date_due jika belum kembali)

-- =========================
-- 9. DETAIL RENTAL
-- =========================
CREATE TABLE Detail_Rental (
    id        INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_rental INT NOT NULL,
    id_item   INT NOT NULL,
    quantity  INT NOT NULL DEFAULT 1,

    FOREIGN KEY (id_rental) REFERENCES Rental(id) ON DELETE CASCADE,
    FOREIGN KEY (id_item)   REFERENCES Items(id)  ON DELETE CASCADE
);

-- =========================
-- 10. RETURNED
-- =========================
CREATE TABLE Returned (
    id            INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_rental     INT NOT NULL,             -- link ke transaksi rental-nya
    id_petugas    INT NOT NULL,
    id_peminjam   INT NOT NULL,
    date_returned DATETIME NOT NULL,
    is_late       TINYINT(1) NOT NULL DEFAULT 0,  -- 0 = tepat waktu, 1 = terlambat
    late_fee      DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    FOREIGN KEY (id_rental)   REFERENCES Rental(id) ON DELETE CASCADE,
    FOREIGN KEY (id_petugas)  REFERENCES Users(id)  ON DELETE CASCADE,
    FOREIGN KEY (id_peminjam) REFERENCES Users(id)  ON DELETE CASCADE
);
