import getDB from './db.js';

export const createOrderFromProduct = async (createdProduct) => {
    const db = await getDB();

    await db.query('BEGIN');

    const { rows } = await db.query(`
        INSERT INTO orders (initial_order_time) VALUES ($1) RETURNING id;
    `, [new Date()]);

    const createdOrder = rows[0];

    await db.query(`
        INSERT INTO order_products (
            product_id,
            order_id,
            quantity,
            strike_price
        )
        VALUES (
            $1,
            $2,
            1,
            $3
        );
    `, [createdProduct.id, createdOrder.id, createdProduct.price]);

    await db.query(`COMMIT`);
};
