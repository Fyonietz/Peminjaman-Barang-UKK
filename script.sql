CREATE DATABASE UKK;

USE UKK;

-- =========================
-- TABLE ROLES
-- =========================
CREATE TABLE Roles (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO Roles (name)
VALUES ('Admin'), ('Petugas'), ('Peminjam');

-- =========================
-- TABLE USERS
-- =========================
CREATE TABLE Users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_role INT NOT NULL,

    FOREIGN KEY (id_role)
    REFERENCES Roles(id)
    ON DELETE CASCADE
);

-- =========================
-- TABLE CATEGORY
-- =========================
CREATE TABLE Category (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

-- =========================
-- TABLE STATUSES
-- =========================
CREATE TABLE Statuses (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO Statuses (name)
VALUES
('Pending'),
('Approve'),
('Rejected'),
('Rented'),
('Returned'),
('Late'),
('Cancelled');

-- =========================
-- TABLE ITEMS
-- =========================
CREATE TABLE Items (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_category INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    id_status INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_category)
    REFERENCES Category(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_status)
    REFERENCES Statuses(id)
    ON DELETE CASCADE
);

-- =========================
-- TABLE RENTAL
-- =========================
CREATE TABLE Rental (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_petugas INT NOT NULL,
    id_peminjam INT NOT NULL,
    date_rent DATETIME NOT NULL,
    date_returned DATETIME,
    id_status INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_petugas)
    REFERENCES Users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_peminjam)
    REFERENCES Users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_status)
    REFERENCES Statuses(id)
    ON DELETE CASCADE
);

-- =========================
-- TABLE DETAIL RENTAL
-- =========================
CREATE TABLE Detail_Rental (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_rental INT NOT NULL,
    id_item INT NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (id_rental)
    REFERENCES Rental(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_item)
    REFERENCES Items(id)
    ON DELETE CASCADE
);

-- =========================
-- TABLE RETURNED
-- =========================
CREATE TABLE Returned (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_petugas INT NOT NULL,
    id_peminjam INT NOT NULL,
    id_status INT NOT NULL,
    date_returned DATETIME NOT NULL,

    FOREIGN KEY (id_petugas)
    REFERENCES Users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_peminjam)
    REFERENCES Users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_status)
    REFERENCES Statuses(id)
    ON DELETE CASCADE
);
