const { dbConnection } = require('./db');

class MarkManagerModel {
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
                console.log('MarkManagerModel: Connecting to database...');
                await dbConnection.connect();
            }
            this.db = dbConnection.getDatabase();
            console.log('MarkManagerModel: Database connection ready');
        } catch (error) {
            console.error('MarkManagerModel: Database initialization failed:', error.message);
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
     * Get student marks data for LinkedList initialization
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result with students data
     */
    async getStudentsForMarking(filters) {
        try {
            const { year, className, testNumber, subject } = filters;

            console.log('Getting students for marking with filters:', filters);

            const db = await this.getDb();
            
            if (!db) {
                console.warn('Database not available, returning mock data');
                return this.getMockStudentsData(filters);
            }

            // Find summary that matches the criteria
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                console.log('No summary found for criteria:', { year: parseInt(year), name: className });
                return {
                    success: false,
                    error: 'No summary found for the specified year and class name'
                };
            }

            console.log('Found summary:', summary.id);

            // Check if marks already exist for this test
            const existingMarks = await db.collection('marks').find({
                summary_id: summary.id,
                test_number: parseInt(testNumber)
            }).toArray();

            const studentsData = [];

            if (existingMarks.length > 0) {
                // Use existing marks data
                console.log(`Found ${existingMarks.length} existing marks records`);
                
                existingMarks.forEach(mark => {
                    const subjectMark = mark.marks[subject] || 0;
                    studentsData.push({
                        index: mark.index,
                        mark: subjectMark,
                        isInitialized: subjectMark > 0 // Consider 0 as not initialized
                    });
                });
            } else {
                // Generate new students data from summary
                console.log(`Generating new student data for ${summary.student_count} students`);
                
                for (let i = 1; i <= summary.student_count; i++) {
                    studentsData.push({
                        index: i,
                        mark: 0, // Initialize with 0
                        isInitialized: false
                    });
                }
            }

            // Sort by index
            studentsData.sort((a, b) => a.index - b.index);

            return {
                success: true,
                students: studentsData,
                summary: {
                    id: summary.id,
                    name: summary.name,
                    year: summary.year,
                    test_count: summary.test_count,
                    student_count: summary.student_count
                },
                filters: filters
            };

        } catch (error) {
            console.error('Model error fetching students data:', error.message);
            return {
                success: false,
                error: 'Internal server error: ' + error.message
            };
        }
    }

    /**
     * Return mock students data when database is not available
     * @param {Object} filters - Filter criteria
     * @returns {Object} Mock students data
     */
    getMockStudentsData(filters) {
        const { year, className, testNumber, subject } = filters;
        
        console.log('Generating mock students data for:', filters);

        const studentsData = [];
        const studentCount = 25; // Default student count

        for (let i = 1; i <= studentCount; i++) {
            studentsData.push({
                index: i,
                mark: 0, // Initialize with 0
                isInitialized: false
            });
        }

        return {
            success: true,
            students: studentsData,
            summary: {
                id: 'mock_summary',
                name: className,
                year: parseInt(year),
                test_count: 3,
                student_count: studentCount
            },
            filters: filters,
            note: 'This is mock data - database not available'
        };
    }

    /**
     * Save marks data in bulk to database
     * @param {Array} marksData - Array of student marks
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result of save operation
     */
    async saveMarksInBulk(marksData, filters) {
        try {
            console.log('Saving marks in bulk:', { marksCount: marksData.length, filters });

            const { year, className, testNumber, subject } = filters;

            const db = await this.getDb();
            
            if (!db) {
                console.log('Database not available');
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Find summary
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                console.log('Summary not found for:', { year: parseInt(year), name: className });
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            console.log('Found summary:', summary.id);

            // Prepare bulk operations
            const bulkOps = [];
            const currentTime = new Date().toISOString();

            marksData.forEach((studentData, index) => {
                const updateQuery = {
                    summary_id: summary.id,
                    test_number: parseInt(testNumber),
                    index: studentData.index
                };

                const updateData = {
                    $set: {
                        [`marks.${subject}`]: parseFloat(studentData.mark),
                        updated_at: currentTime
                    },
                    $setOnInsert: {
                        id: this.generateMarkId(),
                        summary_id: summary.id,
                        test_number: parseInt(testNumber),
                        index: studentData.index,
                        created_at: currentTime
                    }
                };

                // Don't set marks in $setOnInsert since we're setting it in $set
                // The marks object will be created automatically when we set marks.subject

                bulkOps.push({
                    updateOne: {
                        filter: updateQuery,
                        update: updateData,
                        upsert: true
                    }
                });
            });

            console.log(`Executing bulk operation with ${bulkOps.length} operations`);

            // Execute bulk operation
            const result = await db.collection('marks').bulkWrite(bulkOps);

            console.log('Bulk operation completed:', {
                matched: result.matchedCount,
                modified: result.modifiedCount,
                upserted: result.upsertedCount
            });

            return {
                success: true,
                message: 'Marks saved successfully',
                updated_count: result.modifiedCount,
                inserted_count: result.upsertedCount,
                matched_count: result.matchedCount
            };

        } catch (error) {
            console.error('Model error saving marks in bulk:', error);
            return {
                success: false,
                error: 'Internal server error: ' + error.message
            };
        }
    }

    /**
     * Update a single student's mark
     * @param {Object} studentData - Student mark data
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result of update operation
     */
    async updateSingleMark(studentData, filters) {
        try {
            const { year, className, testNumber, subject } = filters;

            const db = await this.getDb();
            
            if (!db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Find summary
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            // Update single mark
            const updateQuery = {
                summary_id: summary.id,
                test_number: parseInt(testNumber),
                index: studentData.index
            };

            const updateData = {
                $set: {
                    [`marks.${subject}`]: parseFloat(studentData.mark),
                    updated_at: new Date().toISOString()
                }
            };

            const result = await db.collection('marks').updateOne(updateQuery, updateData);

            return {
                success: result.matchedCount > 0,
                message: result.matchedCount > 0 ? 'Mark updated successfully' : 'No record found to update',
                modified_count: result.modifiedCount
            };

        } catch (error) {
            console.error('Model error updating single mark:', error.message);
            return {
                success: false,
                error: 'Internal server error: ' + error.message
            };
        }
    }

    /**
     * Check if marks exist for the given criteria
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result with existence check
     */
    async checkMarksExist(filters) {
        try {
            const { year, className, testNumber, subject } = filters;

            const db = await this.getDb();
            
            if (!db) {
                return {
                    success: true,
                    exists: false,
                    note: 'Database not available'
                };
            }

            // Find summary
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            // Check if any marks exist for this test and subject
            const existingMarks = await db.collection('marks').findOne({
                summary_id: summary.id,
                test_number: parseInt(testNumber),
                [`marks.${subject}`]: { $exists: true, $gt: 0 }
            });

            return {
                success: true,
                exists: !!existingMarks,
                summary_id: summary.id
            };

        } catch (error) {
            console.error('Model error checking marks existence:', error.message);
            return {
                success: false,
                error: 'Internal server error: ' + error.message
            };
        }
    }

    /**
     * Generate unique mark ID
     * @returns {string} Unique mark ID
     */
    generateMarkId() {
        return 'MRK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Validate mark value
     * @param {number} mark - Mark value to validate
     * @returns {Object} Validation result
     */
    static validateMark(mark) {
        const numMark = parseFloat(mark);
        
        if (isNaN(numMark)) {
            return {
                valid: false,
                error: 'Mark must be a valid number'
            };
        }

        if (numMark < 0 || numMark > 100) {
            return {
                valid: false,
                error: 'Mark must be between 0 and 100'
            };
        }

        return {
            valid: true,
            mark: numMark
        };
    }

    /**
     * Get marks statistics for the given criteria
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Result with statistics
     */
    async getMarksStatistics(filters) {
        try {
            const { year, className, testNumber, subject } = filters;

            const db = await this.getDb();
            
            if (!db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Find summary
            const summary = await db.collection('summaries').findOne({
                year: parseInt(year),
                name: className
            });

            if (!summary) {
                return {
                    success: false,
                    error: 'Summary not found'
                };
            }

            // Get all marks for this test and subject
            const pipeline = [
                {
                    $match: {
                        summary_id: summary.id,
                        test_number: parseInt(testNumber),
                        [`marks.${subject}`]: { $exists: true }
                    }
                },
                {
                    $project: {
                        mark: `$marks.${subject}`,
                        index: 1
                    }
                },
                {
                    $match: {
                        mark: { $gt: 0 } // Only consider marks greater than 0
                    }
                }
            ];

            const marksData = await db.collection('marks').aggregate(pipeline).toArray();
            const marks = marksData.map(item => item.mark);

            if (marks.length === 0) {
                return {
                    success: true,
                    statistics: {
                        total_students: 0,
                        entered_marks: 0,
                        pending_marks: summary.student_count,
                        average: 0,
                        highest: 0,
                        lowest: 0,
                        completion_percentage: 0
                    }
                };
            }

            // Calculate statistics
            const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
            const highest = Math.max(...marks);
            const lowest = Math.min(...marks);
            const completionPercentage = (marks.length / summary.student_count) * 100;

            return {
                success: true,
                statistics: {
                    total_students: summary.student_count,
                    entered_marks: marks.length,
                    pending_marks: summary.student_count - marks.length,
                    average: parseFloat(average.toFixed(2)),
                    highest: highest,
                    lowest: lowest,
                    completion_percentage: parseFloat(completionPercentage.toFixed(2))
                }
            };

        } catch (error) {
            console.error('Model error getting marks statistics:', error.message);
            return {
                success: false,
                error: 'Internal server error: ' + error.message
            };
        }
    }
}

module.exports = MarkManagerModel;