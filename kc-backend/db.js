const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables from the .env file

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,       // Database host
    user: process.env.DB_USER,       // Database user
    password: process.env.DB_PASS,    // Database password
    database: process.env.DB_NAME,    // Database name
    waitForConnections: true,          // Ensures that the pool waits if all connections are used
    connectionLimit: 10,              // Maximum number of connections in the pool
    queueLimit: 0                      // No limit on the number of queued requests
});

// Test the connection and handle potential errors
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database as ID:', connection.threadId);
    connection.release(); // Release the connection back to the pool
});

// Export the promise-based pool to use async/await
module.exports = pool.promise();
