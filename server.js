const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import controllers
const SubjectTemplateController = require('./src/controller/subject_service/subject_tem');
const { dbConnection } = require('./src/model/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize controller
const subjectTemplateController = new SubjectTemplateController();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Initialize database connection
async function initializeDatabase() {
    try {
        await dbConnection.connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        process.exit(1);
    }
}

// API Routes for Subject Templates
app.get('/api/templates', (req, res) => subjectTemplateController.getAllTemplates(req, res));
app.post('/api/templates', (req, res) => subjectTemplateController.createTemplate(req, res));
app.get('/api/templates/search', (req, res) => subjectTemplateController.searchTemplates(req, res));
app.get('/api/templates/:id', (req, res) => subjectTemplateController.getTemplateById(req, res));
app.put('/api/templates/:id', (req, res) => subjectTemplateController.updateTemplate(req, res));
app.delete('/api/templates/:id', (req, res) => subjectTemplateController.deleteTemplate(req, res));

// Page Routes
app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/subject_tem_home.html'));
});

app.get('/templates/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/subject_tem_create.html'));
});

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Subject Templates: http://localhost:${PORT}/templates`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    try {
        await dbConnection.disconnect();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
    }
});

startServer();

module.exports = app;
