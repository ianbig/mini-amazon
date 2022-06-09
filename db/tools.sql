------------------------------------- get all table -------------------------------------- 
SELECT * FROM "ACCOUNT";
SELECT * FROM "WAREHOUSE";
SELECT * FROM "ITEM";
SELECT * FROM "ORDERS";
SELECT * FROM "PACKAGE";
SELECT * FROM "REQUEST";
------------------------------------------------------------------------------------------



------------------------------- add items and warehouse ----------------------------------







------------------------------- RUN ME ----------------------------------
DELETE FROM "ITEM";

INSERT INTO "ITEM"(item_name, price) VALUES ('book', 999);
INSERT INTO "ITEM"(item_name, price) VALUES ('iPad Pro', 899);
INSERT INTO "ITEM"(item_name, price) VALUES ('MacBook Pro', 2699);
INSERT INTO "ITEM"(item_name, price) VALUES ('iWatch', 399);
INSERT INTO "ITEM"(item_name, price) VALUES ('Pro Display XDR', 4999);
INSERT INTO "ITEM"(item_name, price) VALUES ('Mac Pro', 5999);
------------------------------------------------------------------------------------------







INSERT INTO "WAREHOUSE"(warehouse_id, x_cord, y_cord) VALUES (0, 100, 100);
------------------------------------------------------------------------------------------


--------------------------------- reset items   -------------------------------------------
UPDATE "ITEM" SET stock = 0 WHERE item_id = 1;
UPDATE "ITEM" SET stock = 0 WHERE item_id = 2;
UPDATE "ITEM" SET stock = 0 WHERE item_id = 3;
UPDATE "ITEM" SET stock = 0 WHERE item_id = 4;
UPDATE "ITEM" SET stock = 0 WHERE item_id = 5;
UPDATE "ITEM" SET stock = 0 WHERE item_id = 6;







------------------------------- add stock ----------------------------------
UPDATE "ITEM" SET stock = 4 WHERE item_id = 1;

UPDATE "PACKAGE" SET package_status = 'packed' WHERE package_id = 1;
UPDATE "PACKAGE" SET truck_num = 123 WHERE package_id = 1;

UPDATE "PACKAGE" SET package_status = 'packed' WHERE package_id = 2;
UPDATE "PACKAGE" SET truck_num = 123 WHERE package_id = 2;

UPDATE "PACKAGE" SET package_status = 'packed' WHERE package_id = 3;
UPDATE "PACKAGE" SET truck_num = 123 WHERE package_id = 3;

------------------------------------------------------------------------------------------





------------------------------- delete all orders and package ----------------------------
DELETE FROM "PACKAGE";
DELETE FROM "ORDERS";
DELETE FROM "REQUEST";
DELETE FROM "ITEM";
DELETE FROM "WAREHOUSE";
------------------------------------------------------------------------------------------



------------------------------------ delete all accounts ---------------------------------
DELETE FROM "ACCOUNT";
------------------------------------------------------------------------------------------


------------------------------------- drop all tables ------------------------------------
DROP TABLE "REQUEST";
DROP TABLE "ORDERS";
DROP TABLE "PACKAGE";
DROP TABLE "WAREHOUSE";
DROP TABLE "ACCOUNT";
DROP TABLE "ITEM";
------------------------------------------------------------------------------------------