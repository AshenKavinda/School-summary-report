const { dbConnection } = require('../../model/db');
const xlsx = require('xlsx');
const path = require('path');

class ExportController {
    constructor() {
        this.db = null;
        this.initializeDatabase();
    }

    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        try {
            if (dbConnection.isDbConnected()) {
                this.db = dbConnection.getDatabase();
                console.log('ExportController: Database connection established');
            } else {
                console.log('ExportController: Connecting to database...');
                await dbConnection.connect();
                this.db = dbConnection.getDatabase();
                console.log('ExportController: Database connected successfully');
            }
        } catch (error) {
            console.error('ExportController: Failed to connect to database:', error.message);
            this.db = null;
        }
    }

    /**
     * Get database connection (ensure it's available)
     */
    async getDb() {
        if (!this.db) {
            await this.initializeDatabase();
        }
        return this.db;
    }

    /**
     * Get export page
     */
    async getExportPage(req, res) {
        try {
            const summaryId = req.query.summaryId;
            
            if (!summaryId) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            // Render the export page with summary ID
            res.sendFile(path.join(__dirname, '../../view/export.html'));
        } catch (error) {
            console.error('Error serving export page:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to load export page'
            });
        }
    }

    /**
     * Get summary data by ID
     */
    async getSummaryById(summaryId) {
        try {
            if (!summaryId) {
                return {
                    success: false,
                    error: 'Summary ID is required'
                };
            }

            const db = await this.getDb();
            if (!db) {
                return {
                    success: false,
                    error: 'Database connection not available'
                };
            }

            // Fetch summary from summaries collection
            const summariesCollection = db.collection('summaries');
            const summary = await summariesCollection.findOne({ id: summaryId });

            if (!summary) {
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            return {
                success: true,
                summary: summary
            };
        } catch (error) {
            console.error('Error fetching summary by ID:', error.message);
            return {
                success: false,
                error: 'Failed to fetch summary data'
            };
        }
    }

    /**
     * Get all marks for a summary
     */
    async getMarksBySummaryId(summaryId) {
        try {
            if (!summaryId) {
                return {
                    success: false,
                    error: 'Summary ID is required'
                };
            }

            const db = await this.getDb();
            if (!db) {
                return {
                    success: false,
                    error: 'Database connection not available'
                };
            }

            // Fetch marks from marks collection
            const marksCollection = db.collection('marks');
            const marks = await marksCollection.find({ summary_id: summaryId }).toArray();

            return {
                success: true,
                marks: marks
            };
        } catch (error) {
            console.error('Error fetching marks by summary ID:', error.message);
            return {
                success: false,
                error: 'Failed to fetch marks data'
            };
        }
    }

    /**
     * Get complete export data (summary + marks organized by test)
     */
    async getExportData(req, res) {
        try {
            const summaryId = req.params.summaryId || req.query.summaryId;
            
            if (!summaryId) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            // Get summary data
            const summaryResult = await this.getSummaryById(summaryId);
            if (!summaryResult.success) {
                return res.status(404).json(summaryResult);
            }

            // Get marks data
            const marksResult = await this.getMarksBySummaryId(summaryId);
            if (!marksResult.success) {
                return res.status(500).json(marksResult);
            }

            // Organize marks by test number
            const organizedData = this.organizeMarksByTest(marksResult.marks, summaryResult.summary);

            return res.json({
                success: true,
                summary: summaryResult.summary,
                testData: organizedData,
                totalTests: summaryResult.summary.test_count,
                totalStudents: summaryResult.summary.student_count
            });

        } catch (error) {
            console.error('Error getting export data:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch export data'
            });
        }
    }

    /**
     * Organize marks data by test number
     */
    organizeMarksByTest(marks, summary) {
        const testData = {};
        
        // Initialize test data structure
        for (let testNum = 1; testNum <= summary.test_count; testNum++) {
            testData[testNum] = {
                testNumber: testNum,
                students: [],
                subjects: new Set(),
                averages: {}
            };
        }

        // Group marks by test number
        marks.forEach(mark => {
            const testNum = mark.test_number;
            if (testData[testNum]) {
                testData[testNum].students.push(mark);
                
                // Collect all subjects for this test
                if (mark.marks && typeof mark.marks === 'object') {
                    Object.keys(mark.marks).forEach(subject => {
                        testData[testNum].subjects.add(subject);
                    });
                }
            }
        });

        // Convert subjects Set to Array and calculate averages
        Object.keys(testData).forEach(testNum => {
            testData[testNum].subjects = Array.from(testData[testNum].subjects);
            testData[testNum].averages = this.calculateTestAverages(testData[testNum].students, testData[testNum].subjects);
        });

        return testData;
    }

    /**
     * Calculate average marks for each subject in a test
     */
    calculateTestAverages(students, subjects) {
        const averages = {};
        
        subjects.forEach(subject => {
            const marks = students
                .map(student => student.marks[subject])
                .filter(mark => mark !== null && mark !== undefined && !isNaN(mark))
                .map(mark => parseFloat(mark));
            
            if (marks.length > 0) {
                const sum = marks.reduce((total, mark) => total + mark, 0);
                averages[subject] = Math.round((sum / marks.length) * 100) / 100; // Round to 2 decimal places
            } else {
                averages[subject] = 0;
            }
        });

        return averages;
    }

    /**
     * Export data to Excel file
     */
    async exportToExcel(req, res) {
        try {
            const summaryId = req.params.summaryId || req.query.summaryId;
            
            if (!summaryId) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            // Get export data
            const summaryResult = await this.getSummaryById(summaryId);
            if (!summaryResult.success) {
                return res.status(404).json(summaryResult);
            }

            const marksResult = await this.getMarksBySummaryId(summaryId);
            if (!marksResult.success) {
                return res.status(500).json(marksResult);
            }

            // Organize data
            const organizedData = this.organizeMarksByTest(marksResult.marks, summaryResult.summary);
            
            // Create Excel workbook
            const workbook = xlsx.utils.book_new();
            
            // Add summary sheet
            this.addSummarySheet(workbook, summaryResult.summary);
            
            // Add test sheets
            Object.keys(organizedData).forEach(testNum => {
                this.addTestSheet(workbook, organizedData[testNum], summaryResult.summary);
            });

            // Generate buffer
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            // Set headers for file download
            const fileName = `${summaryResult.summary.name}_${summaryResult.summary.year}_Summary_Report.xlsx`;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            return res.send(buffer);

        } catch (error) {
            console.error('Error exporting to Excel:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to export to Excel'
            });
        }
    }

    /**
     * Add summary information sheet to workbook
     */
    addSummarySheet(workbook, summary) {
        const summaryData = [
            ['Summary Report Information'],
            [''],
            ['Summary ID', summary.id],
            ['Class Name', summary.name],
            ['Year', summary.year],
            ['Total Tests', summary.test_count],
            ['Total Students', summary.student_count],
            ['Created At', new Date(summary.created_at).toLocaleDateString()],
            ['Updated At', new Date(summary.updated_at).toLocaleDateString()]
        ];

        const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
        
        // Set column widths
        summarySheet['!cols'] = [
            { width: 20 },
            { width: 30 }
        ];

        xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary Info');
    }

    /**
     * Add test sheet to workbook
     */
    addTestSheet(workbook, testData, summary) {
        if (!testData.students || testData.students.length === 0) {
            return; // Skip if no data
        }

        // Create headers
        const headers = ['Student ID'];
        testData.subjects.forEach(subject => {
            headers.push(subject);
        });

        // Create data rows
        const rows = [headers];
        
        testData.students.forEach((student, index) => {
            const row = [index + 1]; // Use index + 1 as Student ID
            testData.subjects.forEach(subject => {
                row.push(student.marks[subject] || '');
            });
            rows.push(row);
        });

        // Add averages row
        if (testData.subjects.length > 0) {
            const avgRow = ['AVERAGE'];
            testData.subjects.forEach(subject => {
                avgRow.push(testData.averages[subject] || 0);
            });
            rows.push(['']); // Empty row
            rows.push(avgRow);
        }

        const testSheet = xlsx.utils.aoa_to_sheet(rows);
        
        // Set column widths
        const colWidths = [
            { width: 15 }, // Student ID
        ];
        testData.subjects.forEach(() => {
            colWidths.push({ width: 12 }); // Subject columns
        });
        testSheet['!cols'] = colWidths;

        xlsx.utils.book_append_sheet(workbook, testSheet, `Test ${testData.testNumber}`);
    }
}

module.exports = new ExportController();
