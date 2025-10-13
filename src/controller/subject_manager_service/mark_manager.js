const path = require('path');
const { dbConnection } = require('../../model/db');

class MarkManagerController {
    constructor() {
        this.db = null;
        this.initializeDatabase();
    }

    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        try {
            if (!dbConnection.isDbConnected()) {
                console.log('MarkManagerController: Connecting to database...');
                await dbConnection.connect();
            }
            this.db = dbConnection.getDatabase();
            console.log('MarkManagerController: Database connection ready');
        } catch (error) {
            console.error('MarkManagerController: Database initialization failed:', error.message);
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
     * Serve the marks manager page
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async renderMarksManager(req, res) {
        try {
            console.log('Serving marks manager page');
            console.log('Query parameters:', req.query);
            
            res.sendFile(path.join(__dirname, '../../view/marks_manager.html'));
        } catch (error) {
            console.error('Error serving marks manager page:', error.message);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Get marks data for specific parameters
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getMarksData(req, res) {
        try {
            console.log('Getting marks data with parameters:', req.query);
            
            const { year, className, testNumber, subject } = req.query;

            // Validation
            if (!year || !className || !testNumber || !subject) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: year, className, testNumber, subject'
                });
            }

            console.log('Validated parameters:', { year, className, testNumber, subject });

            // Get database connection
            const db = await this.getDb();
            
            if (!db) {
                console.warn('Database not available, returning mock data');
                return this.getMockMarksData(req, res);
            }

            // Find summary that matches the criteria
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                console.log('No summary found for criteria:', { year: parseInt(year), name: className });
                return res.status(404).json({
                    success: false,
                    error: 'No summary found for the specified year and class name'
                });
            }

            console.log('Found summary:', summary.id);

            // Find marks for the specific test and subject
            const marks = await db.collection('marks').find({
                summary_id: summary.id,
                test_number: parseInt(testNumber)
            }).toArray();

            console.log(`Found ${marks.length} marks records`);

            // Filter marks by subject and format for frontend
            const subjectMarks = marks.map(mark => {
                const subjectMark = mark.marks[subject];
                return {
                    id: mark.id,
                    summary_id: mark.summary_id,
                    test_number: mark.test_number,
                    student_index: mark.index,
                    student_name: `Student ${mark.index.toString().padStart(2, '0')}`, // Generate student name
                    subject: subject,
                    mark: subjectMark || 0,
                    grade: this.calculateGrade(subjectMark || 0)
                };
            }).sort((a, b) => a.student_index - b.student_index);

            console.log(`Returning ${subjectMarks.length} subject marks`);

            return res.status(200).json({
                success: true,
                marks: subjectMarks,
                summary: {
                    id: summary.id,
                    name: summary.name,
                    year: summary.year,
                    test_count: summary.test_count,
                    student_count: summary.student_count
                },
                filters: {
                    year: parseInt(year),
                    className: className,
                    testNumber: parseInt(testNumber),
                    subject: subject
                }
            });

        } catch (error) {
            console.error('Controller error fetching marks data:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message
            });
        }
    }

    /**
     * Return mock marks data when database is not available
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    getMockMarksData(req, res) {
        const { year, className, testNumber, subject } = req.query;
        
        console.log('Generating mock data for:', { year, className, testNumber, subject });

        // Generate mock marks data
        const mockMarks = [];
        const studentCount = 25;

        for (let i = 1; i <= studentCount; i++) {
            const mark = Math.floor(Math.random() * 41) + 60; // Random mark between 60-100
            mockMarks.push({
                id: `mock_${i}`,
                summary_id: 'mock_summary',
                test_number: parseInt(testNumber),
                student_index: i,
                student_name: `Student ${i.toString().padStart(2, '0')}`,
                subject: subject,
                mark: mark,
                grade: this.calculateGrade(mark)
            });
        }

        return res.status(200).json({
            success: true,
            marks: mockMarks,
            summary: {
                id: 'mock_summary',
                name: className,
                year: parseInt(year),
                test_count: 3,
                student_count: studentCount
            },
            filters: {
                year: parseInt(year),
                className: className,
                testNumber: parseInt(testNumber),
                subject: subject
            },
            note: 'This is mock data - database not available'
        });
    }

    /**
     * Update marks for students
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateMarks(req, res) {
        try {
            console.log('Updating marks with data:', req.body);

            const { marks, filters } = req.body;

            // Validation
            if (!marks || !Array.isArray(marks) || !filters) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request data'
                });
            }

            const { year, className, testNumber, subject } = filters;

            if (!year || !className || !testNumber || !subject) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required filter parameters'
                });
            }

            // Get database connection
            const db = await this.getDb();
            
            if (!db) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not available'
                });
            }

            // Find summary
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                return res.status(404).json({
                    success: false,
                    error: 'Summary not found'
                });
            }

            // Update marks in batch
            const bulkOps = marks.map(markData => {
                const updateQuery = {
                    summary_id: summary.id,
                    test_number: parseInt(testNumber),
                    index: markData.student_index
                };

                const updateData = {
                    $set: {
                        [`marks.${subject}`]: parseFloat(markData.mark),
                        updated_at: new Date().toISOString()
                    }
                };

                return {
                    updateOne: {
                        filter: updateQuery,
                        update: updateData
                    }
                };
            });

            const result = await db.collection('marks').bulkWrite(bulkOps);

            console.log('Bulk update result:', result);

            return res.status(200).json({
                success: true,
                message: 'Marks updated successfully',
                updated_count: result.modifiedCount,
                matched_count: result.matchedCount
            });

        } catch (error) {
            console.error('Controller error updating marks:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message
            });
        }
    }

    /**
     * Export marks data to CSV format
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async exportMarks(req, res) {
        try {
            const { year, className, testNumber, subject } = req.query;

            // Get marks data
            const marksResponse = await this.getMarksDataInternal(year, className, testNumber, subject);
            
            if (!marksResponse.success) {
                return res.status(400).json(marksResponse);
            }

            // Generate CSV content
            const csvContent = this.generateCSV(marksResponse.marks, {
                year, className, testNumber, subject
            });

            // Set headers for file download
            const filename = `marks_${className}_${subject}_Test${testNumber}_${year}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            return res.status(200).send(csvContent);

        } catch (error) {
            console.error('Controller error exporting marks:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message
            });
        }
    }

    /**
     * Internal method to get marks data
     * @param {string} year - Year
     * @param {string} className - Class name
     * @param {string} testNumber - Test number
     * @param {string} subject - Subject
     * @returns {Object} Marks data response
     */
    async getMarksDataInternal(year, className, testNumber, subject) {
        // Create mock request/response for internal use
        const mockReq = { query: { year, className, testNumber, subject } };
        let responseData = null;
        
        const mockRes = {
            status: () => mockRes,
            json: (data) => { responseData = data; return mockRes; }
        };

        await this.getMarksData(mockReq, mockRes);
        return responseData;
    }

    /**
     * Generate CSV content from marks data
     * @param {Array} marks - Marks data
     * @param {Object} filters - Filter information
     * @returns {string} CSV content
     */
    generateCSV(marks, filters) {
        const headers = [
            'Student Index',
            'Student Name',
            'Subject',
            'Mark',
            'Grade',
            'Test Number',
            'Class',
            'Year'
        ];

        const rows = marks.map(mark => [
            mark.student_index,
            mark.student_name,
            mark.subject,
            mark.mark,
            mark.grade,
            filters.testNumber,
            filters.className,
            filters.year
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Calculate grade based on mark
     * @param {number} mark - The mark value
     * @returns {string} Grade letter
     */
    calculateGrade(mark) {
        if (mark >= 90) return 'A+';
        if (mark >= 85) return 'A';
        if (mark >= 80) return 'A-';
        if (mark >= 75) return 'B+';
        if (mark >= 70) return 'B';
        if (mark >= 65) return 'B-';
        if (mark >= 60) return 'C+';
        if (mark >= 55) return 'C';
        if (mark >= 50) return 'C-';
        return 'F';
    }

    /**
     * Get statistics for marks
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getMarksStatistics(req, res) {
        try {
            const { year, className, testNumber, subject } = req.query;

            // Get marks data
            const marksResponse = await this.getMarksDataInternal(year, className, testNumber, subject);
            
            if (!marksResponse.success) {
                return res.status(400).json(marksResponse);
            }

            const marks = marksResponse.marks.map(m => m.mark);
            
            // Calculate statistics
            const stats = {
                total_students: marks.length,
                average: marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2) : 0,
                highest: marks.length > 0 ? Math.max(...marks) : 0,
                lowest: marks.length > 0 ? Math.min(...marks) : 0,
                grade_distribution: this.calculateGradeDistribution(marks),
                pass_rate: this.calculatePassRate(marks)
            };

            return res.status(200).json({
                success: true,
                statistics: stats,
                filters: { year, className, testNumber, subject }
            });

        } catch (error) {
            console.error('Controller error getting statistics:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message
            });
        }
    }

    /**
     * Calculate grade distribution
     * @param {Array} marks - Array of marks
     * @returns {Object} Grade distribution
     */
    calculateGradeDistribution(marks) {
        const distribution = {};
        
        marks.forEach(mark => {
            const grade = this.calculateGrade(mark);
            distribution[grade] = (distribution[grade] || 0) + 1;
        });

        return distribution;
    }

    /**
     * Calculate pass rate (assuming 50 is passing grade)
     * @param {Array} marks - Array of marks
     * @returns {number} Pass rate percentage
     */
    calculatePassRate(marks) {
        if (marks.length === 0) return 0;
        
        const passCount = marks.filter(mark => mark >= 50).length;
        return ((passCount / marks.length) * 100).toFixed(2);
    }
}

module.exports = MarkManagerController;