import pg from 'pg';
import chalk from 'chalk';

const { Client } = pg;

const DATABASE_URI = process.env.DATABASE_URI || '2310_build_session_1';

let db;

const getDB = async () => {
    if (db) {
        return db;
    }

    console.log(chalk.cyan(`Connecting to database: ${DATABASE_URI}...`));

    try {
        db = new Client(`postgresql://eszwajkowski@localhost:5432/${DATABASE_URI}`);
        await db.connect();
        console.log(chalk.green(`Connected to database: ${DATABASE_URI}`));
    } catch (e) {
        console.log(chalk.red(`Failed to connect to database: ${DATABASE_URI}`));
        console.error(e);

        throw e;
    }

    return  db;
};

export default getDB;
