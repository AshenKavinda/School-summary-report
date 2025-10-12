// Example usage of the database connection
require('dotenv').config();
const { dbConnection } = require('./src/model/db.js');

(async () => {
    try {
        await dbConnection.connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
})();