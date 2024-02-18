import getDB from './db.js';

export const getCart = async () => {
    const db = await getDB();

    const { rows: [cartOrder] } = await db.query(`
        SELECT id AS order_id, initial_order_time FROM orders WHERE status = 'cart' LIMIT 1;
    `);

    const { rows: cartOrderProducts } = await db.query(`
        SELECT products.id AS product_id, order_products.id AS order_product_id, strike_price AS price, name, description FROM order_products 
        JOIN products ON products.id = order_products.product_id 
        WHERE order_id = $1;
    `, [cartOrder.order_id]);

    return {
        ...cartOrder,
        products: cartOrderProducts,
        totalPrice: cartOrderProducts.reduce((total, orderProduct) => {
            return total + parseFloat(orderProduct.price);
        }, 0),
    };
};
