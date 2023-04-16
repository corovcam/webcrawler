import { createPool } from 'mysql2';
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '3307';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'tazkeheslo';
const database = process.env.DB_NAME || 'webcrawler';
const limit = process.env.MYSQL_CONNECTION_LIMIT || '100';

const connection = createPool({
    "host": host,
    "port": parseInt(port),
    "user": user,
    "password": password,
    "database": database,
    "connectionLimit": parseInt(limit)
});

export default connection;
