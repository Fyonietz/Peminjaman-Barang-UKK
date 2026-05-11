CREATE DATABASE UKK;

USE UKK:


CREATE TABLE Roles(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

INSERT INTO Roles(name) VALUES('Admin'),('Petugas'),('Peminjam');

CREATE TABLE Users(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  id_role INT,

  FOREIGN KEY (id_role) REFERENCES Roles(id) ON DELETE CASCADE
);

CREATE TABLE Category(
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE Status(
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

INSERT INTO Status(name) VALUES ('Pending'),('Approve'),('Rejected'),('Rented'),('Returned'),('Late'),('Cancelled');

CREATE TABLE Items(
  id INT NOT NULL PRIMARY KEY,
  id_category INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  stock INT NOT NULL,
  id_status INT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  
  FOREIGN KEY (id_category) REFERENCES Category(id) ON DELETE CASCADE,
  FOREIGN KEY (id_status) REFERENCES Status(id) ON DELETE CASCADE
);

CREATE TABLE Rental(
  id INT NOT NULL PRIMARY KEY,
  id_petugas INT,
  id_peminjam INT,
  date_rent DATETIME,
  date_returned DATETIME,
  id_status INT,
  total_price DECIMAL(10,2)

  FOREIGN KEY (id_petugas) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_peminjam) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_status) REFERENCES Status(id) ON DELETE CASCADE,
);

CREATE TABLE Detail_Rental(
  id INT NOT NULL PRIMARY KEY,
  id_rental INT,
  id_item INT,
  quantity INT,


  FOREIGN KEY (id_rental) REFERENCES Rental(id) ON DELETE CASCADE,
  FOREIGN KEY (id_item) REFERENCES Items(id) ON DELETE CASCADE
);

CREATE TABLE Returned(
  id INT NOT NULL PRIMARY KEY,
  id_petugas INT,
  id_peminjam INT,
  id_status INT,
  date_returned DATETIME,

  FOREIGN KEY (id_petugas) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_status) REFERENCES Status(id) ON DELETE CASCADE,
  FOREIGN KEY (id_peminjam) REFERENCES Users(id) ON DELETE CASCADE
);

