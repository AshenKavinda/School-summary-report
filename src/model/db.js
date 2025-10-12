const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const DB_CONFIG = {
    url: process.env.MONGODB_URL,
    dbName: process.env.DB_NAME,
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }
};

class DatabaseConnection {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    /**
     * Initialize and connect to MongoDB database
     * @returns {Promise<boolean>} Connection status
     */
    async connect() {
        try {
            if (this.isConnected && this.client) {
                console.log('Database already connected');
                return true;
            }

            console.log('Connecting to MongoDB...');
            this.client = new MongoClient(DB_CONFIG.url, DB_CONFIG.options);
            
            await this.client.connect();
            
            // Test the connection
            await this.client.db(DB_CONFIG.dbName).admin().ping();
            
            this.db = this.client.db(DB_CONFIG.dbName);
            this.isConnected = true;
            
            console.log(`Successfully connected to MongoDB database: ${DB_CONFIG.dbName}`);
            return true;
            
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Get database instance
     * @returns {Object} MongoDB database instance
     */
    getDatabase() {
        if (!this.isConnected || !this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    /**
     * Get a specific collection
     * @param {string} collectionName - Name of the collection
     * @returns {Object} MongoDB collection instance
     */
    getCollection(collectionName) {
        if (!collectionName) {
            throw new Error('Collection name is required');
        }
        return this.getDatabase().collection(collectionName);
    }

    /**
     * Close database connection
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            if (this.client && this.isConnected) {
                await this.client.close();
                this.client = null;
                this.db = null;
                this.isConnected = false;
                console.log('Database connection closed');
            }
        } catch (error) {
            console.error('Error closing database connection:', error.message);
            throw error;
        }
    }

    /**
     * Check if database is connected
     * @returns {boolean} Connection status
     */
    isDbConnected() {
        return this.isConnected;
    }

    /**
     * Get connection status and database info
     * @returns {Object} Database status information
     */
    getStatus() {
        return {
            connected: this.isConnected,
            databaseName: DB_CONFIG.dbName,
            url: DB_CONFIG.url.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
        };
    }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();

// Auto-connect when module is imported (optional)
// Uncomment the following lines if you want auto-connection
/*
(async () => {
    try {
        await dbConnection.connect();
    } catch (error) {
        console.error('Failed to auto-connect to database:', error.message);
    }
})();
*/

// Export the singleton instance and class
module.exports = {
    dbConnection,
    DatabaseConnection,
    DB_CONFIG
};