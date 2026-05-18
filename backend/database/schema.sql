-- =====================================================================
-- Schema bazei de date MySQL pentru aplicatia coffee-thing-app
-- =====================================================================
-- Acoperă cele 3 zone de testare din cerinta:
--   1. Autentificare (users)        -> register + login
--   2. Logica de business           -> orders, order_items (calcul total)
--   3. Operatii CRUD                -> products + autorizare pe proprietar
--
-- NOTA: acest fisier contine DOAR definitiile tabelelor. Crearea bazei
-- de date (CREATE DATABASE / USE) este gestionata de scriptul init-db.js,
-- astfel incat aceeasi schema sa functioneze atat pentru baza de date de
-- productie (coffee_thing) cat si pentru cea de test (coffee_thing_test).
--
-- Rulare prin script:  npm run init-db   /   npm run init-db:test
-- =====================================================================

-- ---------------------------------------------------------------------
-- Ordinea de stergere respecta cheile straine (copiii inaintea parintilor)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS tables_seating;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------
-- Tabela: users
-- Pentru Task 1 (Autentificare - register + login)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL,
  -- parola este stocata HASH-uita cu bcrypt, niciodata in clar
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- constrangerea de unicitate => testul "email duplicat" va esua corect
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: products
-- Pentru Task 3 (Operatii CRUD). Coloana owner_id permite testarea
-- autorizarii: un utilizator poate edita / sterge doar produsele proprii.
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  category    ENUM('coffee','espresso','tea','desserts','cold-drinks','breakfast')
              NOT NULL DEFAULT 'coffee',
  image       VARCHAR(255)  DEFAULT '/images/products/default.jpg',
  available   BOOLEAN       NOT NULL DEFAULT TRUE,
  -- proprietarul produsului (cine l-a creat); folosit pentru autorizare
  owner_id    INT           NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: tables_seating  (mesele din cafenea)
-- Numele 'tables' este cuvant rezervat in SQL, deci folosim alt nume.
-- ---------------------------------------------------------------------
CREATE TABLE tables_seating (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  number     INT NOT NULL,
  capacity   INT NOT NULL,
  status     ENUM('free','occupied','reserved') NOT NULL DEFAULT 'free',
  CONSTRAINT uq_tables_number UNIQUE (number),
  CONSTRAINT chk_tables_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: customers (clientii asezati la o masa)
-- ---------------------------------------------------------------------
CREATE TABLE customers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  table_id   INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_table
    FOREIGN KEY (table_id) REFERENCES tables_seating(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: orders (comenzile)
-- Pentru Task 2 (Logica de business - calcul total, discount, taxe).
-- ---------------------------------------------------------------------
CREATE TABLE orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  customer_id    INT NOT NULL,
  table_id       INT NOT NULL,
  status         ENUM('pending','preparing','ready','delivered','paid')
                 NOT NULL DEFAULT 'pending',
  payment_method ENUM('cash','card') DEFAULT NULL,
  payment_status ENUM('unpaid','pending','paid') NOT NULL DEFAULT 'unpaid',
  subtotal       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_by     INT NOT NULL,  -- utilizatorul care a creat comanda
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_table
    FOREIGN KEY (table_id) REFERENCES tables_seating(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: order_items (liniile dintr-o comanda)
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,  -- pretul produsului la momentul comenzii
  line_total  DECIMAL(10,2) NOT NULL,  -- quantity * unit_price
  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Indecsi pentru performanta cautarilor frecvente
-- ---------------------------------------------------------------------
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_owner    ON products(owner_id);
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_items_order       ON order_items(order_id);

-- =====================================================================
-- Date initiale (seed) - mese din cafenea
-- =====================================================================
INSERT INTO tables_seating (number, capacity, status) VALUES
  (1, 2, 'free'),     (2, 2, 'free'),     (3, 4, 'free'),
  (4, 4, 'reserved'), (5, 6, 'free'),     (6, 2, 'free'),
  (7, 4, 'free'),     (8, 8, 'free'),     (9, 2, 'reserved'),
  (10, 4, 'free'),    (11, 6, 'free'),    (12, 2, 'free');

-- Produsele si utilizatorul admin sunt inserate de scriptul init-db.js,
-- pentru ca parola admin trebuie hash-uita cu bcrypt (nu se poate in SQL pur).
