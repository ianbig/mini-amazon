
------------------------------- Create tables -------------------------------
CREATE TABLE "ITEM"(
    item_id SERIAL,
    item_name VARCHAR(256) NOT NULL,
    price FLOAT NOT NULL,
    stock INT DEFAULT 0 CHECK (stock >= 0),
    PRIMARY KEY (item_id)
);

CREATE TABLE "ACCOUNT"(
    user_name VARCHAR(15),
    user_password VARCHAR(20) NOT NULL,
    user_email VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_name)
);

CREATE TABLE "WAREHOUSE"(
    warehouse_id INT,
    x_cord INT NOT NULL,
    y_cord INT NOT NULL,
    PRIMARY KEY (warehouse_id)
);

CREATE TABLE "PACKAGE"(
    package_id SERIAL,
    package_owner VARCHAR(15),   --foreign key
    warehouse_id INT,        --foreign key
    package_price FLOAT,
    x_dest INT,
    y_dest INT,
    package_status VARCHAR(20) DEFAULT 'processing',
    truck_num INT,
    ups_name VARCHAR(50) DEFAULT '10',
    PRIMARY KEY (package_id),
    FOREIGN KEY (package_owner) REFERENCES "ACCOUNT"(user_name) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES "WAREHOUSE"(warehouse_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ORDERS"(
    order_id SERIAL,
    package_id INT,
    item_name VARCHAR(256) NOT NULL,
    item_id INT,
    count INT,
    order_price FLOAT,
    order_owner VARCHAR(15) NOT NULL,
    order_status VARCHAR(15) DEFAULT 'InCart',
    PRIMARY KEY (order_id),
    FOREIGN KEY (package_id) REFERENCES "PACKAGE"(package_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (item_id) REFERENCES "ITEM"(item_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (order_owner) REFERENCES "ACCOUNT"(user_name) ON DELETE SET NULL ON UPDATE CASCADE
);





CREATE TABLE "REQUEST"(
    seq_number INT,
    request_status VARCHAR(20) DEFAULT 'processing',
    content jsonb,
    encoderType VARCHAR(50),
    PRIMARY KEY (seq_number)
);