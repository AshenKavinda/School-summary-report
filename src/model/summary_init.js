const { v4: uuidv4 } = require('uuid');
const { dbConnection } = require('./db');

class SummaryInitModel {
    constructor() {
        this.db = null;
        this.initializeDatabase();
    }

    /**
     * Initialize the database connection
     */
    async initializeDatabase() {
        try {
            if (dbConnection.isDbConnected()) {
                this.db = dbConnection.getDatabase();
                console.log('SummaryInitModel: Database already connected');
            } else {
                console.log('SummaryInitModel: Database not connected, attempting to connect...');
                await dbConnection.connect();
                this.db = dbConnection.getDatabase();
                console.log('SummaryInitModel: Database connection established successfully');
            }
        } catch (error) {
            console.error('SummaryInitModel: Failed to connect to database:', error.message);
            console.error('Environment variables check:', {
                MONGODB_URL: process.env.MONGODB_URL ? 'Set' : 'Not set',
                DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set'
            });
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
     * Get all available years from existing summaries
     * @returns {Promise<Object>} Result with years array
     */
    async getAvailableYears() {
        try {
            const db = await this.getDb();
            
            if (db) {
                // Database query to get distinct years from summaries collection
                const years = await db.collection('summaries').distinct('year');
                return {
                    success: true,
                    years: years.sort((a, b) => b - a) // Sort descending
                };
            } else {
                // Fallback for when database is not connected
                console.warn('Database not available, using fallback data');
                const years = [2024, 2023, 2022, 2021, 2020];
                return {
                    success: true,
                    years: years
                };
            }
        } catch (error) {
            console.error('Error fetching years:', error.message);
            return {
                success: false,
                error: 'Failed to fetch available years',
                years: []
            };
        }
    }

    /**
     * Get all available class names from existing summaries
     * @returns {Promise<Object>} Result with names array
     */
    async getAvailableNames() {
        try {
            const db = await this.getDb();
            
            if (db) {
                // Database query to get distinct class names from summaries collection
                const names = await db.collection('summaries').distinct('name');
                return {
                    success: true,
                    names: names.sort() // Sort alphabetically
                };
            } else {
                // Fallback for when database is not connected
                console.warn('Database not available, using fallback data');
                const names = [
                    'Grade 10 A',
                    'Grade 10 B',
                    'Grade 11 A',
                    'Grade 11 B',
                    'Grade 12 A',
                    'Grade 12 B',
                    'Advanced Level Science',
                    'Advanced Level Commerce'
                ];
                return {
                    success: true,
                    names: names
                };
            }
        } catch (error) {
            console.error('Error fetching class names:', error.message);
            return {
                success: false,
                error: 'Failed to fetch available class names',
                names: []
            };
        }
    }

    /**
     * Get all available test numbers from existing summaries
     * @returns {Promise<Object>} Result with tests array
     */
    async getAvailableTests() {
        try {
            // In real implementation: Generate test numbers based on test_count from summaries
            if (this.db) {
                // Get all summaries and extract test numbers
                const summaries = await this.db.collection('summaries').find({}).toArray();
                const testNumbers = new Set();
                
                summaries.forEach(summary => {
                    for (let i = 1; i <= summary.test_count; i++) {
                        testNumbers.add(`Test ${i}`);
                    }
                });
                
                // Convert Set to sorted array
                const tests = Array.from(testNumbers).sort((a, b) => {
                    const numA = parseInt(a.split(' ')[1]);
                    const numB = parseInt(b.split(' ')[1]);
                    return numA - numB;
                });
                
                return {
                    success: true,
                    tests: tests
                };
            } else {
                // Fallback for when database is not connected
                const tests = ['Test 1', 'Test 2', 'Test 3', 'Mid-term', 'Final'];
                return {
                    success: true,
                    tests: tests
                };
            }
        } catch (error) {
            console.error('Error fetching tests:', error.message);
            return {
                success: false,
                error: 'Failed to fetch available tests',
                tests: []
            };
        }
    }

    /**
     * Get summary data based on filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result with summaries and subjects
     */
    async getSummaryData(filters = {}) {
        try {
            let summaries = [];
            let subjects = [];

            const db = await this.getDb();
            
            if (db) {
                // Build query based on filters
                const query = {};
                if (filters.year) query.year = parseInt(filters.year);
                if (filters.name) query.name = filters.name;
                
                console.log('Querying summaries with filters:', query);
                
                // Get summaries from database
                summaries = await db.collection('summaries').find(query).toArray();
                console.log(`Found ${summaries.length} summaries`);
                
                // Get subjects from marks collection
                if (summaries.length > 0 || (filters.year && filters.name && filters.test)) {
                    // First try to match with the exact summary IDs
                    let marksQuery = {};
                    let marksWithSubjects = [];
                    
                    if (summaries.length > 0) {
                        const summaryIds = summaries.map(s => s.id);
                        marksQuery.summary_id = { $in: summaryIds };
                        
                        if (filters.test) {
                            // Extract test number from test string (e.g., "Test 1" -> 1)
                            const testNum = filters.test.replace(/\D/g, '');
                            if (testNum) {
                                marksQuery.test_number = parseInt(testNum);
                            }
                        }
                        
                        console.log('Querying marks with summary IDs:', marksQuery);
                        marksWithSubjects = await db.collection('marks')
                            .find(marksQuery)
                            .limit(1)
                            .toArray();
                    }
                    
                    // If no matching marks found with summary IDs, try a broader search
                    // This handles cases where summary IDs don't match marks records exactly
                    if (marksWithSubjects.length === 0 && filters.test) {
                        console.log('No marks found for summary IDs, trying broader search...');
                        
                        const broadQuery = {};
                        const testNum = filters.test.replace(/\D/g, '');
                        if (testNum) {
                            broadQuery.test_number = parseInt(testNum);
                        }
                        
                        console.log('Broader marks query:', broadQuery);
                        marksWithSubjects = await db.collection('marks')
                            .find(broadQuery)
                            .limit(1)
                            .toArray();
                            
                        if (marksWithSubjects.length > 0) {
                            console.log('Found marks with broader search');
                        }
                    }
                    
                    // Extract subjects from found marks
                    if (marksWithSubjects.length > 0) {
                        subjects = Object.keys(marksWithSubjects[0].marks || {});
                        console.log('Found subjects:', subjects);
                    } else if (filters.year && filters.name && filters.test) {
                        // If all filters are provided but no marks found, provide fallback subjects
                        // This ensures the UI still shows subject options
                        console.log('Using fallback subjects for complete filter set');
                        
                        // Try to get any subjects from the marks collection
                        const anyMarks = await db.collection('marks')
                            .find({})
                            .limit(1)
                            .toArray();
                            
                        if (anyMarks.length > 0) {
                            subjects = Object.keys(anyMarks[0].marks || {});
                        } else {
                            // Ultimate fallback
                            subjects = ['Mathematics', 'Science', 'English', 'History'];
                        }
                        console.log('Using fallback subjects:', subjects);
                    }
                }
            } else {
                // Fallback for when database is not connected
                console.warn('Database not available, using fallback data');
                if (filters.year || filters.name || filters.test) {
                    summaries = [
                        {
                            id: 'SUM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                            name: filters.name || 'Grade 10 A',
                            year: parseInt(filters.year) || 2024,
                            test_count: 3,
                            student_count: 25
                        }
                    ];

                    subjects = [
                        'Mathematics',
                        'Science',
                        'English',
                        'History',
                        'Geography'
                    ];
                }
            }

            return {
                success: true,
                summaries: summaries,
                subjects: subjects,
                filters: filters
            };
        } catch (error) {
            console.error('Error fetching summary data:', error.message);
            return {
                success: false,
                error: 'Failed to fetch summary data',
                summaries: [],
                subjects: []
            };
        }
    }

    /**
     * Check if a summary name already exists for a given year
     * @param {string} name - Class name
     * @param {number} year - Year
     * @param {string} excludeId - ID to exclude from check (for updates)
     * @returns {Promise<boolean>} True if name exists
     */
    async summaryNameExists(name, year, excludeId = null) {
        try {
            const db = await this.getDb();
            
            if (db) {
                const query = { name: name, year: parseInt(year) };
                if (excludeId) {
                    query.id = { $ne: excludeId };
                }
                
                const existingSummary = await db.collection('summaries').findOne(query);
                return !!existingSummary;
            } else {
                // For simulation, return false (name doesn't exist)
                console.warn('Database not available for name check');
                return false;
            }
        } catch (error) {
            console.error('Error checking summary name:', error.message);
            throw error;
        }
    }

    /**
     * Create a new summary report
     * @param {Object} summaryData - Summary data
     * @returns {Promise<Object>} Result with created summary
     */
    async createSummary(summaryData) {
        try {
            const { name, year, test_count, student_count } = summaryData;

            // Validate required fields
            if (!name || !year || !test_count || !student_count) {
                return {
                    success: false,
                    error: 'Missing required fields'
                };
            }

            // Check if name already exists for this year
            const nameExists = await this.summaryNameExists(name, year);
            if (nameExists) {
                return {
                    success: false,
                    error: 'Class name already exists for this year'
                };
            }

            // Generate unique ID
            const summaryId = this.generateSummaryId();

            // Create summary object
            const summary = {
                id: summaryId,
                name: name.trim(),
                year: parseInt(year),
                test_count: parseInt(test_count),
                student_count: parseInt(student_count),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Save to database
            const db = await this.getDb();
            if (db) {
                const result = await db.collection('summaries').insertOne(summary);
                console.log('Summary saved to database:', result.insertedId);
                
                return {
                    success: true,
                    summary: summary
                };
            } else {
                console.warn('Database not available, summary not saved');
                return {
                    success: false,
                    error: 'Database connection not available'
                };
            }

        } catch (error) {
            console.error('Error creating summary:', error.message);
            return {
                success: false,
                error: 'Failed to create summary: ' + error.message
            };
        }
    }

    /**
     * Create marks records for a summary
     * @param {Array} marksData - Array of marks objects
     * @returns {Promise<Object>} Result with created marks
     */
    async createMarks(marksData) {
        try {
            if (!Array.isArray(marksData) || marksData.length === 0) {
                return {
                    success: false,
                    error: 'Invalid marks data'
                };
            }

            const createdMarks = [];
            const db = await this.getDb();

            if (!db) {
                console.warn('Database not available, marks not saved');
                return {
                    success: false,
                    error: 'Database connection not available'
                };
            }

            // Process each marks record
            for (const markRecord of marksData) {
                const { summary_id, test_number, index, marks } = markRecord;

                // Validate required fields
                if (!summary_id || !test_number || !index || !marks) {
                    console.warn('Skipping invalid mark record:', markRecord);
                    continue;
                }

                // Generate unique ID for marks record
                const markId = this.generateMarkId();

                const markObj = {
                    id: markId,
                    summary_id: summary_id,
                    test_number: parseInt(test_number),
                    index: parseInt(index),
                    marks: marks,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                createdMarks.push(markObj);
            }

            // Bulk insert all marks
            if (createdMarks.length > 0) {
                const result = await db.collection('marks').insertMany(createdMarks);
                console.log(`Created ${result.insertedCount} marks records in database`);

                return {
                    success: true,
                    marks: createdMarks,
                    count: result.insertedCount
                };
            } else {
                return {
                    success: false,
                    error: 'No valid marks records to save'
                };
            }

        } catch (error) {
            console.error('Error creating marks:', error.message);
            return {
                success: false,
                error: 'Failed to create marks records: ' + error.message
            };
        }
    }

    /**
     * Initialize a complete summary report (summary + marks)
     * @param {Object} initData - Initialization data
     * @returns {Promise<Object>} Result with created summary and marks
     */
    async initializeSummary(initData) {
        try {
            console.log('Starting summary initialization...');
            const { summary, marks, subjects } = initData;

            // Validate input data
            if (!summary || !marks || !subjects) {
                console.log('Missing required initialization data');
                return {
                    success: false,
                    error: 'Missing required initialization data'
                };
            }

            console.log('Creating summary...');
            // Create summary
            const summaryResult = await this.createSummary(summary);
            if (!summaryResult.success) {
                console.log('Failed to create summary:', summaryResult.error);
                return summaryResult;
            }

            console.log('Summary created successfully, updating marks with correct summary ID...');
            
            // Update all marks to use the actual summary ID from the database
            const actualSummaryId = summaryResult.summary.id;
            const updatedMarks = marks.map(mark => ({
                ...mark,
                summary_id: actualSummaryId
            }));
            
            console.log(`Updated ${updatedMarks.length} marks records to use summary ID: ${actualSummaryId}`);
            
            // Create marks with correct summary ID
            const marksResult = await this.createMarks(updatedMarks);
            if (!marksResult.success) {
                console.log('Failed to create marks:', marksResult.error);
                // In a real database implementation, you would rollback the summary creation here
                return {
                    success: false,
                    error: 'Failed to create marks: ' + marksResult.error
                };
            }

            console.log('Summary initialization completed successfully');
            return {
                success: true,
                message: 'Summary report initialized successfully',
                data: {
                    summary: summaryResult.summary,
                    marks: marksResult.marks,
                    subjects: subjects,
                    totalMarksRecords: marksResult.count
                }
            };

        } catch (error) {
            console.error('Error initializing summary:', error.message);
            console.error('Stack trace:', error.stack);
            return {
                success: false,
                error: 'Failed to initialize summary report: ' + error.message
            };
        }
    }

    /**
     * Get summary by ID
     * @param {string} summaryId - Summary ID
     * @returns {Promise<Object>} Result with summary data
     */
    async getSummaryById(summaryId) {
        try {
            if (!summaryId) {
                return {
                    success: false,
                    error: 'Summary ID is required'
                };
            }

            // Simulate database query
            // In real implementation: SELECT * FROM summaries WHERE id = ?
            
            // For simulation, return a mock summary
            const summary = {
                id: summaryId,
                name: 'Sample Summary',
                year: 2024,
                test_count: 3,
                student_count: 25,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            return {
                success: true,
                summary: summary
            };
        } catch (error) {
            console.error('Error fetching summary by ID:', error.message);
            return {
                success: false,
                error: 'Failed to fetch summary'
            };
        }
    }

    /**
     * Get marks for a summary
     * @param {string} summaryId - Summary ID
     * @param {number} testNumber - Optional test number filter
     * @returns {Promise<Object>} Result with marks data
     */
    async getMarksBySummary(summaryId, testNumber = null) {
        try {
            if (!summaryId) {
                return {
                    success: false,
                    error: 'Summary ID is required'
                };
            }

            // Simulate database query
            // In real implementation: SELECT * FROM marks WHERE summary_id = ? [AND test_number = ?]
            
            const marks = [];
            // Generate mock marks data based on test number filter
            
            return {
                success: true,
                marks: marks
            };
        } catch (error) {
            console.error('Error fetching marks:', error.message);
            return {
                success: false,
                error: 'Failed to fetch marks'
            };
        }
    }

    /**
     * Delete a summary and all its marks
     * @param {string} summaryId - Summary ID
     * @returns {Promise<Object>} Result of deletion
     */
    async deleteSummary(summaryId) {
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

            // Check if summary exists
            const existingSummary = await db.collection('summaries').findOne({ id: summaryId });
            
            if (!existingSummary) {
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            try {
                // Start by deleting all marks associated with this summary
                console.log(`Deleting marks for summary ID: ${summaryId}`);
                const marksDeleteResult = await db.collection('marks').deleteMany({ 
                    summary_id: summaryId 
                });
                
                console.log(`Deleted ${marksDeleteResult.deletedCount} marks records`);

                // Then delete the summary itself
                console.log(`Deleting summary with ID: ${summaryId}`);
                const summaryDeleteResult = await db.collection('summaries').deleteOne({ 
                    id: summaryId 
                });

                if (summaryDeleteResult.deletedCount === 0) {
                    return {
                        success: false,
                        error: 'Failed to delete summary'
                    };
                }

                console.log('Summary and all associated data deleted successfully');

                return {
                    success: true,
                    message: 'Summary and all associated marks deleted successfully',
                    data: {
                        summaryId: summaryId,
                        deletedMarksCount: marksDeleteResult.deletedCount,
                        summaryName: existingSummary.name,
                        summaryYear: existingSummary.year
                    }
                };

            } catch (deleteError) {
                console.error('Error during deletion process:', deleteError.message);
                throw deleteError;
            }

        } catch (error) {
            console.error('Error deleting summary:', error.message);
            return {
                success: false,
                error: 'Failed to delete summary: ' + error.message
            };
        }
    }

    /**
     * Generate unique summary ID
     * @returns {string} Unique summary ID
     */
    generateSummaryId() {
        return 'SUM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Generate unique mark ID
     * @returns {string} Unique mark ID
     */
    generateMarkId() {
        return 'MRK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Validate marks data structure
     * @param {Object} marks - Marks object
     * @returns {Object} Validation result
     */
    static validateMarks(marks) {
        if (!marks || typeof marks !== 'object') {
            return {
                valid: false,
                error: 'Marks must be an object'
            };
        }

        const subjects = Object.keys(marks);
        if (subjects.length === 0) {
            return {
                valid: false,
                error: 'At least one subject mark is required'
            };
        }

        // Validate each mark value
        for (const subject of subjects) {
            const mark = marks[subject];
            if (typeof mark !== 'number' || mark < 0 || mark > 100) {
                return {
                    valid: false,
                    error: `Invalid mark for ${subject}. Marks must be numbers between 0 and 100`
                };
            }
        }

        return {
            valid: true,
            subjects: subjects
        };
    }

    /**
     * Get summary statistics
     * @returns {Promise<Object>} Summary statistics
     */
    async getSummaryStatistics() {
        try {
            // Simulate database queries for statistics
            const stats = {
                total_summaries: 0,
                total_students: 0,
                total_marks_records: 0,
                years_covered: [],
                most_recent_summary: null
            };

            return {
                success: true,
                statistics: stats
            };
        } catch (error) {
            console.error('Error fetching statistics:', error.message);
            return {
                success: false,
                error: 'Failed to fetch statistics'
            };
        }
    }
}

module.exports = SummaryInitModel;