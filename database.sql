create table users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(225),
  email VARCHAR(225),
  password VARCHAR(225),
  role VARCHAR(225)
);

CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE priseitems (
  id SERIAL PRIMARY KEY,
  name VARCHAR(225),
  texts TEXT,
  email VARCHAR(225)
);

CREATE TABLE pacets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(225),
  texts TEXT,
  prise TEXT
);

CREATE TABLE galerey (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  name_center VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    comment TEXT,
    center VARCHAR(50) NOT NULL CHECK (center IN ('ТРЦ Happy Молл', 'ТЦ Победа плаза')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP
);


{
    "name": "Новый пользователь",
    "email": "admin@example.com",
    "password": "qwerty123"
}

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'; 