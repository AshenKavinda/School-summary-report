const SubjectTemplateModel = require('../../model/subject_tem');
const path = require('path');

class SubjectTemplateController {
    constructor() {
        this.templateModel = new SubjectTemplateModel();
    }

    /**
     * Handle template creation request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async createTemplate(req, res) {
        try {
            const { name, subjects } = req.body;

            // Validation
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Template name is required'
                });
            }

            if (!Array.isArray(subjects) || subjects.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one subject is required'
                });
            }

            // Check if template name already exists
            const nameExists = await this.templateModel.templateNameExists(name);
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Template name already exists'
                });
            }

            // Create template
            const result = await this.templateModel.createTemplate({
                name: name.trim(),
                subjects: subjects.filter(subject => subject && subject.trim()) // Remove empty subjects
            });

            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Controller error creating template:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Handle get all templates request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAllTemplates(req, res) {
        try {
            const result = await this.templateModel.getAllTemplates();
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
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
     * Handle get template by ID request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getTemplateById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Template ID is required'
                });
            }

            const result = await this.templateModel.getTemplateById(id);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error fetching template by ID:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Handle template update request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateTemplate(req, res) {
        try {
            const { id } = req.params;
            const { name, subjects } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Template ID is required'
                });
            }

            // Validation
            if (name && !name.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Template name cannot be empty'
                });
            }

            if (subjects && (!Array.isArray(subjects) || subjects.length === 0)) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one subject is required'
                });
            }

            // Check if new name already exists (excluding current template)
            if (name) {
                const nameExists = await this.templateModel.templateNameExists(name, id);
                if (nameExists) {
                    return res.status(400).json({
                        success: false,
                        error: 'Template name already exists'
                    });
                }
            }

            const updateData = {};
            if (name) updateData.name = name.trim();
            if (subjects) updateData.subjects = subjects.filter(subject => subject && subject.trim());

            const result = await this.templateModel.updateTemplate(id, updateData);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error updating template:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Handle template deletion request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async deleteTemplate(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Template ID is required'
                });
            }

            const result = await this.templateModel.deleteTemplate(id);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Controller error deleting template:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Handle template search request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async searchTemplates(req, res) {
        try {
            const { q } = req.query;

            if (!q || !q.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Search term is required'
                });
            }

            const result = await this.templateModel.searchTemplates(q.trim());
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Controller error searching templates:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                templates: []
            });
        }
    }

    /**
     * Serve the templates home page
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async renderHomePage(req, res) {
        try {
            res.sendFile(path.join(__dirname, '../../view/subject_tem_home.html'));
        } catch (error) {
            console.error('Error serving home page:', error.message);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Serve the template creation page
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async renderCreatePage(req, res) {
        try {
            res.sendFile(path.join(__dirname, '../../view/subject_tem_create.html'));
        } catch (error) {
            console.error('Error serving create page:', error.message);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Client-side helper function to validate subject data
     * @param {Array} subjects - Array of subjects
     * @returns {Object} Validation result
     */
    static validateSubjects(subjects) {
        if (!Array.isArray(subjects)) {
            return {
                valid: false,
                error: 'Subjects must be an array'
            };
        }

        if (subjects.length === 0) {
            return {
                valid: false,
                error: 'At least one subject is required'
            };
        }

        // Filter out empty subjects
        const validSubjects = subjects.filter(subject => 
            subject && typeof subject === 'string' && subject.trim().length > 0
        );

        if (validSubjects.length === 0) {
            return {
                valid: false,
                error: 'At least one valid subject is required'
            };
        }

        // Check for duplicates
        const uniqueSubjects = [...new Set(validSubjects.map(s => s.trim().toLowerCase()))];
        if (uniqueSubjects.length !== validSubjects.length) {
            return {
                valid: false,
                error: 'Duplicate subjects are not allowed'
            };
        }

        return {
            valid: true,
            subjects: validSubjects.map(s => s.trim())
        };
    }
}

module.exports = SubjectTemplateController;