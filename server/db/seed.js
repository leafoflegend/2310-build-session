import chalk from 'chalk';
import esMain from 'es-main';
import getDB from './db.js';
import { createOrderFromProduct } from './order_products.js';

// CART

// Products Table
// Products
// Prices

// Inventory Table
// Quantity

// Discounts/Payments Table
// Discounts
// Payment Information

// Orders Table
// Status
// Unfulfilled, Fulfilled, Shipped, Delivered, In Warranty, Out of Warranty, Returned

// User/Guest Table ???
// Users - Filled out User Row
// Guest Users
// - Barely Filled out User Row
// - You need to clean this up

// Shipments Table
// What carrier/specific shipment is an order related to?

// Customer Service Sessions Table
// Notes
// Customer Service Rep
// Specific Order ID

/*
Products and Orders

product a
product b

many to many relation
"through tables"

orderProducts
orderId
productId
metadata: quantity, strike price

order a
order b

user a
user b

user a <- order a <- product a & product b
user b <- order b <- product a

how do we differentiate product a amongst user a and b?

 */


let db;


const createExtensions = async () => {
    const db = await getDB();

    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
}

const dropTablesInOrder = async () => {
    const db = await getDB();

    await db.query(`
        DROP TABLE IF EXISTS order_products;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS products;
    `);
};

const createOrdersTable = async () => {
    const db = await getDB();

    await db.query(`
        DROP TYPE IF EXISTS order_status;
        CREATE TYPE order_status AS ENUM (
            'cart', 
            'ordered', 
            'shipped', 
            'delivered'
        );
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status order_status DEFAULT 'cart',
            initial_order_time TIMESTAMP NOT NULL
        );
    `);
};

const createProductsTable = async () => {
    const db = await getDB();

    await db.query(`
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL
        );
    `);
};

const createOrderProductsTable = async () => {
    const db = await getDB();

    await db.query(`
        CREATE TABLE IF NOT EXISTS order_products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID REFERENCES products(id),
            order_id UUID REFERENCES orders(id),
            quantity INTEGER DEFAULT 1,
            strike_price NUMERIC(10, 2) NOT NULL
        );
    `);
};

const insertDummyProducts = async () => {
    const db = await getDB();

    const { rows } = await db.query(`
        INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id, price;
    `, ['Widget', 'Widgets are great for all your needs!', 4.20]);

    return rows[0];
};

const insertDummyOrders = async (createdProduct) => {
    await createOrderFromProduct(createdProduct);
};

const seed = async (createDummyData = false) => {
    const db = await getDB();

    try {
        await dropTablesInOrder();
        await createExtensions();
        await createOrdersTable();
        await createProductsTable();
        await createOrderProductsTable();

        if (createDummyData) {
            const createdProduct = await insertDummyProducts();
            await insertDummyOrders(createdProduct);
        }

        console.log(chalk.green(`Seed script done.`));
    } catch (e) {
        console.log(chalk.red(`Failed to seed DB.`));
        console.error(e);
    } finally {
        if (db) {
            await db.end();
        }
    }
};

if (esMain(import.meta)) {
    const isDEV = process.env.NODE_ENV === 'development';

    seed(isDEV);
}

export default seed;
