import pg from "pg";
import { CREATE_TABLES_QUERY } from "./queries.js";

export default class PG {
    constructor() {
        this.URL = process.env.DB_URL || 'postgres://postgres:123456578@localhost:5432/postgres';
        this.pool = new pg.Pool({
            connectionString: this.URL,
            max: (Number(process.env.DB_POOL) || 200),
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 10000
        });
        this.pool.on('error', this.connect);

        this.connect();
    }

    getPool() {
        return this.pool;
    }

    async connect() {
        try {
            console.log(`Connecting to db ${this.URL}`);
            const client = await this.pool.connect();
            try {
                console.log(`Connected to db ${this.URL}`);
                await client.query(CREATE_TABLES_QUERY);
                console.log("Initialization is completed");
            } finally {
                client.release();
            }
        } catch(err){
            setTimeout(() => {
                this.connect();
                console.error(`database.js: an error occurred when connecting ${err} retrying connection on 3 secs`);
            }, 3000)
        }
    }
}