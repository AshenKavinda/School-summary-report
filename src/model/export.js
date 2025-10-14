const { dbConnection } = require('./db');

class ExportModel {
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
                console.log('ExportModel: Database connection established');
            } else {
                console.log('ExportModel: Connecting to database...');
                await dbConnection.connect();
                this.db = dbConnection.getDatabase();
                console.log('ExportModel: Database connected successfully');
            }
        } catch (error) {
            console.error('ExportModel: Failed to connect to database:', error.message);
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
     * Get summary by ID from database
     */
    async getSummaryById(summaryId) {
        try {
            const db = await this.getDb();
            if (!db) {
                throw new Error('Database connection not available');
            }

            const summariesCollection = db.collection('summaries');
            const summary = await summariesCollection.findOne({ id: summaryId });

            return summary;
        } catch (error) {
            console.error('Error fetching summary by ID:', error.message);
            throw error;
        }
    }

    /**
     * Get all marks for a summary from database
     */
    async getMarksBySummaryId(summaryId) {
        try {
            const db = await this.getDb();
            if (!db) {
                throw new Error('Database connection not available');
            }

            const marksCollection = db.collection('marks');
            const marks = await marksCollection.find({ summary_id: summaryId }).toArray();

            return marks;
        } catch (error) {
            console.error('Error fetching marks by summary ID:', error.message);
            throw error;
        }
    }

    /**
     * Get all subjects for a summary
     */
    async getSubjectsBySummaryId(summaryId) {
        try {
            const marks = await this.getMarksBySummaryId(summaryId);
            const subjects = new Set();

            marks.forEach(mark => {
                if (mark.marks && typeof mark.marks === 'object') {
                    Object.keys(mark.marks).forEach(subject => {
                        subjects.add(subject);
                    });
                }
            });

            return Array.from(subjects);
        } catch (error) {
            console.error('Error fetching subjects by summary ID:', error.message);
            throw error;
        }
    }

    /**
     * Get marks grouped by test number
     */
    async getMarksGroupedByTest(summaryId) {
        try {
            const marks = await this.getMarksBySummaryId(summaryId);
            const groupedMarks = {};

            marks.forEach(mark => {
                const testNum = mark.test_number;
                if (!groupedMarks[testNum]) {
                    groupedMarks[testNum] = [];
                }
                groupedMarks[testNum].push(mark);
            });

            return groupedMarks;
        } catch (error) {
            console.error('Error grouping marks by test:', error.message);
            throw error;
        }
    }

    /**
     * Calculate statistics for marks data
     */
    calculateMarkStatistics(marks, subjects) {
        const statistics = {};

        subjects.forEach(subject => {
            const subjectMarks = marks
                .map(mark => mark.marks[subject])
                .filter(mark => mark !== null && mark !== undefined && !isNaN(mark))
                .map(mark => parseFloat(mark));

            if (subjectMarks.length > 0) {
                const sum = subjectMarks.reduce((total, mark) => total + mark, 0);
                const average = sum / subjectMarks.length;
                const min = Math.min(...subjectMarks);
                const max = Math.max(...subjectMarks);

                statistics[subject] = {
                    average: Math.round(average * 100) / 100,
                    min: min,
                    max: max,
                    count: subjectMarks.length
                };
            } else {
                statistics[subject] = {
                    average: 0,
                    min: 0,
                    max: 0,
                    count: 0
                };
            }
        });

        return statistics;
    }
}

module.exports = ExportModel;
