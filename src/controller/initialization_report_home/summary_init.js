const SummaryInitModel = require('../../model/summary_init');
const SubjectTemplateModel = require('../../model/subject_tem');
const { dbConnection } = require('../../model/db');
const path = require('path');

class SummaryInitController {
    constructor() {
        this.summaryModel = new SummaryInitModel();
        this.templateModel = new SubjectTemplateModel();
        this.initializeDatabase();
    }

    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        try {
            if (!dbConnection.isDbConnected()) {
                console.log('SummaryInitController: Connecting to database...');
                await dbConnection.connect();
            }
            console.log('SummaryInitController: Database connection ready');
        } catch (error) {
            console.error('SummaryInitController: Database initialization failed:', error.message);
        }
    }

    /**
     * Serve the summary home page
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async renderSummaryHome(req, res) {
        try {
            res.sendFile(path.join(__dirname, '../../view/summary_home.html'));
        } catch (error) {
            console.error('Error serving summary home page:', error.message);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Serve the summary initialization page
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async renderInitializationPage(req, res) {
        try {
            res.sendFile(path.join(__dirname, '../../view/summary_initialization.html'));
        } catch (error) {
            console.error('Error serving initialization page:', error.message);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Get available years for dropdown
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAvailableYears(req, res) {
        try {
            const result = await this.summaryModel.getAvailableYears();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching years:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                years: []
            });
        }
    }

    /**
     * Get available class names for dropdown
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAvailableNames(req, res) {
        try {
            const result = await this.summaryModel.getAvailableNames();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching class names:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                names: []
            });
        }
    }

    /**
     * Get available tests for dropdown
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAvailableTests(req, res) {
        try {
            const result = await this.summaryModel.getAvailableTests();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching tests:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                tests: []
            });
        }
    }

    /**
     * Get summary data based on filters
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getSummaryData(req, res) {
        try {
            const filters = {
                year: req.query.year,
                name: req.query.name,
                test: req.query.test
            };

            // Remove undefined values
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key];
                }
            });

            const result = await this.summaryModel.getSummaryData(filters);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching summary data:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                summaries: [],
                subjects: []
            });
        }
    }

    /**
     * Initialize a new summary report
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async initializeSummary(req, res) {
        try {
            console.log('Received initialization request');
            console.log('Request body:', JSON.stringify(req.body, null, 2));
            
            const { summary, marks, subjects } = req.body;

            // Validation
            if (!summary || !marks || !subjects) {
                console.log('Missing required data in request');
                return res.status(400).json({
                    success: false,
                    error: 'Missing required data: summary, marks, and subjects are required'
                });
            }

            // Validate summary data
            const summaryValidation = this.validateSummaryData(summary);
            if (!summaryValidation.valid) {
                console.log('Summary validation failed:', summaryValidation.error);
                return res.status(400).json({
                    success: false,
                    error: summaryValidation.error
                });
            }

            // Validate marks data
            const marksValidation = this.validateMarksData(marks);
            if (!marksValidation.valid) {
                console.log('Marks validation failed:', marksValidation.error);
                return res.status(400).json({
                    success: false,
                    error: marksValidation.error
                });
            }

            // Validate subjects data
            const subjectsValidation = this.validateSubjectsData(subjects);
            if (!subjectsValidation.valid) {
                console.log('Subjects validation failed:', subjectsValidation.error);
                return res.status(400).json({
                    success: false,
                    error: subjectsValidation.error
                });
            }

            console.log('All validations passed, checking for existing name...');

            // Check if summary name already exists
            const nameExists = await this.summaryModel.summaryNameExists(
                summary.name, 
                summary.year
            );
            if (nameExists) {
                console.log('Class name already exists for this year');
                return res.status(400).json({
                    success: false,
                    error: 'Class name already exists for this year'
                });
            }

            console.log('Name check passed, initializing summary...');

            // Initialize summary
            const result = await this.summaryModel.initializeSummary({
                summary,
                marks,
                subjects
            });

            console.log('Summary initialization result:', result);

            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(500).json(result);
            }

        } catch (error) {
            console.error('Controller error initializing summary:', error.message);
            console.error('Stack trace:', error.stack);
            return res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message
            });
        }
    }

    /**
     * Get summary details by ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getSummaryById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            const result = await this.summaryModel.getSummaryById(id);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error fetching summary by ID:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get marks for a summary
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getMarksBySummary(req, res) {
        try {
            const { summaryId } = req.params;
            const { testNumber } = req.query;

            if (!summaryId) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            const result = await this.summaryModel.getMarksBySummary(
                summaryId, 
                testNumber ? parseInt(testNumber) : null
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error fetching marks:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Delete a summary report
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async deleteSummary(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Summary ID is required'
                });
            }

            const result = await this.summaryModel.deleteSummary(id);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error deleting summary:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get summary statistics
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getSummaryStatistics(req, res) {
        try {
            const result = await this.summaryModel.getSummaryStatistics();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching statistics:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get available templates (delegated to template controller)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAvailableTemplates(req, res) {
        try {
            const result = await this.templateModel.getAllTemplates();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Controller error fetching templates:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                templates: []
            });
        }
    }

    /**
     * Validate summary data
     * @param {Object} summary - Summary data to validate
     * @returns {Object} Validation result
     */
    validateSummaryData(summary) {
        if (!summary || typeof summary !== 'object') {
            return {
                valid: false,
                error: 'Summary data must be an object'
            };
        }

        const { name, year, test_count, student_count } = summary;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return {
                valid: false,
                error: 'Class name is required and must be a non-empty string'
            };
        }

        if (!year || typeof year !== 'number' || year < 2020 || year > 2030) {
            return {
                valid: false,
                error: 'Year must be a number between 2020 and 2030'
            };
        }

        if (!test_count || typeof test_count !== 'number' || test_count < 1 || test_count > 10) {
            return {
                valid: false,
                error: 'Test count must be a number between 1 and 10'
            };
        }

        if (!student_count || typeof student_count !== 'number' || student_count < 1 || student_count > 100) {
            return {
                valid: false,
                error: 'Student count must be a number between 1 and 100'
            };
        }

        return { valid: true };
    }

    /**
     * Validate marks data
     * @param {Array} marks - Marks data to validate
     * @returns {Object} Validation result
     */
    validateMarksData(marks) {
        if (!Array.isArray(marks)) {
            return {
                valid: false,
                error: 'Marks data must be an array'
            };
        }

        if (marks.length === 0) {
            return {
                valid: false,
                error: 'At least one marks record is required'
            };
        }

        for (let i = 0; i < marks.length; i++) {
            const mark = marks[i];
            
            if (!mark || typeof mark !== 'object') {
                return {
                    valid: false,
                    error: `Marks record at index ${i} must be an object`
                };
            }

            const { summary_id, test_number, index, marks: markValues } = mark;

            if (!summary_id || typeof summary_id !== 'string') {
                return {
                    valid: false,
                    error: `Summary ID is required for marks record at index ${i}`
                };
            }

            if (!test_number || typeof test_number !== 'number' || test_number < 1) {
                return {
                    valid: false,
                    error: `Valid test number is required for marks record at index ${i}`
                };
            }

            if (!index || typeof index !== 'number' || index < 1) {
                return {
                    valid: false,
                    error: `Valid student index is required for marks record at index ${i}`
                };
            }

            // Validate individual marks
            const marksValidation = SummaryInitModel.validateMarks(markValues);
            if (!marksValidation.valid) {
                return {
                    valid: false,
                    error: `Invalid marks for record at index ${i}: ${marksValidation.error}`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validate subjects data
     * @param {Array} subjects - Subjects data to validate
     * @returns {Object} Validation result
     */
    validateSubjectsData(subjects) {
        if (!Array.isArray(subjects)) {
            return {
                valid: false,
                error: 'Subjects data must be an array'
            };
        }

        if (subjects.length === 0) {
            return {
                valid: false,
                error: 'At least one subject is required'
            };
        }

        for (let i = 0; i < subjects.length; i++) {
            const subject = subjects[i];
            
            if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
                return {
                    valid: false,
                    error: `Subject at index ${i} must be a non-empty string`
                };
            }
        }

        // Check for duplicates
        const uniqueSubjects = [...new Set(subjects.map(s => s.trim().toLowerCase()))];
        if (uniqueSubjects.length !== subjects.length) {
            return {
                valid: false,
                error: 'Duplicate subjects are not allowed'
            };
        }

        return { valid: true };
    }

    /**
     * Helper method to format error response
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Formatted error response
     */
    formatErrorResponse(message, statusCode = 500) {
        return {
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Helper method to format success response
     * @param {Object} data - Response data
     * @param {string} message - Success message
     * @returns {Object} Formatted success response
     */
    formatSuccessResponse(data, message = 'Operation completed successfully') {
        return {
            success: true,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SummaryInitController;