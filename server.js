const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import controllers
const SubjectTemplateController = require('./src/controller/subject_service/subject_tem');
const SummaryInitController = require('./src/controller/initialization_report_home/summary_init');
const MarkManagerController = require('./src/controller/subject_manager_service/mark_manager');
const ExportController = require('./src/controller/report_service/export');
const { dbConnection } = require('./src/model/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize controllers
const subjectTemplateController = new SubjectTemplateController();
const summaryInitController = new SummaryInitController();
const markManagerController = new MarkManagerController();

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
        
        // Set database for models if needed
        console.log('Database connection established for all models');
        
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        console.log('Server will continue without database connection');
        // Don't exit, allow server to run without database for development
    }
}

// API Routes for Subject Templates
app.get('/api/templates', (req, res) => subjectTemplateController.getAllTemplates(req, res));
app.post('/api/templates', (req, res) => subjectTemplateController.createTemplate(req, res));
app.get('/api/templates/search', (req, res) => subjectTemplateController.searchTemplates(req, res));
app.get('/api/templates/:id', (req, res) => subjectTemplateController.getTemplateById(req, res));
app.put('/api/templates/:id', (req, res) => subjectTemplateController.updateTemplate(req, res));
app.delete('/api/templates/:id', (req, res) => subjectTemplateController.deleteTemplate(req, res));

// API Routes for Summary Management
app.get('/api/summary/years', (req, res) => summaryInitController.getAvailableYears(req, res));
app.get('/api/summary/names', (req, res) => summaryInitController.getAvailableNames(req, res));
app.get('/api/summary/tests', (req, res) => summaryInitController.getAvailableTests(req, res));
app.get('/api/summary/data', (req, res) => summaryInitController.getSummaryData(req, res));
app.get('/api/summary/filter', (req, res) => summaryInitController.getSummaryData(req, res));
app.post('/api/summary/initialize', (req, res) => summaryInitController.initializeSummary(req, res));
app.get('/api/summary/statistics', (req, res) => summaryInitController.getSummaryStatistics(req, res));
app.get('/api/summary/:id', (req, res) => summaryInitController.getSummaryById(req, res));
app.get('/api/summary/:summaryId/marks', (req, res) => summaryInitController.getMarksBySummary(req, res));
app.delete('/api/summary/:id', (req, res) => summaryInitController.deleteSummary(req, res));

// API Routes for Marks Manager (LinkedList-based)
app.get('/api/marks/students', (req, res) => markManagerController.getStudentsForLinkedList(req, res));
app.post('/api/marks/save-bulk', (req, res) => markManagerController.saveMarksFromLinkedList(req, res));
app.put('/api/marks/single', (req, res) => markManagerController.updateSingleMark(req, res));
app.get('/api/marks/statistics', (req, res) => markManagerController.getMarksStatistics(req, res));

// API Routes for Export
app.get('/api/export/data/:summaryId', (req, res) => ExportController.getExportData(req, res));
app.get('/api/export/excel/:summaryId', (req, res) => ExportController.exportToExcel(req, res));

// Legacy API Routes for Marks Manager (keeping for backward compatibility)
app.get('/api/marks/:summaryId/:subject/:testNumber', (req, res) => markManagerController.getMarksData(req, res));
app.put('/api/marks', (req, res) => markManagerController.updateMarks(req, res));
app.get('/api/marks/:summaryId/:subject/:testNumber/export', (req, res) => markManagerController.exportMarks(req, res));
app.get('/api/marks/:summaryId/:subject/:testNumber/statistics', (req, res) => markManagerController.getMarksStatistics(req, res));

// Page Routes
app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/subject_tem_home.html'));
});

app.get('/templates/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/subject_tem_create.html'));
});

// Summary Report Routes
app.get('/summary', (req, res) => summaryInitController.renderSummaryHome(req, res));
app.get('/summary/initialization', (req, res) => summaryInitController.renderInitializationPage(req, res));
app.get('/summary/details/:id', (req, res) => {
    // Future implementation for summary details page
    res.json({ message: 'Summary details page not implemented yet' });
});

// Marks Manager Route
app.get('/marks_manager', (req, res) => markManagerController.renderMarksManager(req, res));

// Export Route
app.get('/export', (req, res) => ExportController.getExportPage(req, res));

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
