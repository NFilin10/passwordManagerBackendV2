const Pool = require('pg').Pool;
require('dotenv').config();


console.log(process.env.DB_USER)

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});

const execute = async (...queries) => {
    try {
        const client = await pool.connect();
        try {
            for (const query of queries) {
                await client.query(query);
            }
            return true;
        } catch (error) {
            console.error('Error executing query:', error.stack);
            return false;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error acquiring client:', error.stack);
        return false;
    }
};

const createTablesQuery = `
    
    CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "surname" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL
   
    );
    
    CREATE TABLE IF NOT EXISTS "passwords" (
        "id" SERIAL PRIMARY KEY,
        "service_name" VARCHAR(255) NOT NULL,
        "link" varchar(255),
        "login" VARCHAR(255) NOT NULL,
        "password" VARCHAR(700) NOT NULL,
        "user_id" INT NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE

    );
    `;




// A function to execute the create tables query
execute(createTablesQuery).then(result => {
    if (result) {
        console.log('Tables created successfully');
    }
});

module.exports = pool;