import chalk from 'chalk';
import express from 'express';
import { getCart } from './db/cart.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/api/cart', async (req, res) => {
    const cart = await getCart();

    res.send({
        cart,
    });
});

app.listen(PORT, () => {
    console.log(chalk.green(`Server now listening on PORT:${PORT}`));
});
