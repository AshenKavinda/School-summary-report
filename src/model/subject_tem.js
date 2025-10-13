const { dbConnection } = require('./db');
const { ObjectId } = require('mongodb');

class SubjectTemplateModel {
    constructor() {
        this.collectionName = 'subject_templates';
    }

    /**
     * Get the collection instance
     * @returns {Object} MongoDB collection
     */
    getCollection() {
        return dbConnection.getCollection(this.collectionName);
    }

    /**
     * Create a new subject template
     * @param {Object} templateData - Template data {name, subjects}
     * @returns {Promise<Object>} Created template with _id
     */
    async createTemplate(templateData) {
        try {
            const { name, subjects } = templateData;

            if (!name || !Array.isArray(subjects)) {
                throw new Error('Invalid template data. Name and subjects array are required.');
            }

            const template = {
                name: name.trim(),
                subjects: subjects,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const collection = this.getCollection();
            const result = await collection.insertOne(template);

            if (result.insertedId) {
                return {
                    success: true,
                    template_id: result.insertedId,
                    name: template.name,
                    subjects: template.subjects,
                    message: 'Template created successfully'
                };
            } else {
                throw new Error('Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all subject templates
     * @returns {Promise<Array>} Array of templates
     */
    async getAllTemplates() {
        try {
            const collection = this.getCollection();
            const templates = await collection.find({}).toArray();

            return {
                success: true,
                templates: templates.map(template => ({
                    template_id: template._id,
                    name: template.name,
                    subjects: template.subjects,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }))
            };
        } catch (error) {
            console.error('Error fetching templates:', error.message);
            return {
                success: false,
                error: error.message,
                templates: []
            };
        }
    }

    /**
     * Get a specific template by ID
     * @param {string} templateId - Template ID
     * @returns {Promise<Object>} Template data
     */
    async getTemplateById(templateId) {
        try {
            if (!ObjectId.isValid(templateId)) {
                throw new Error('Invalid template ID');
            }

            const collection = this.getCollection();
            const template = await collection.findOne({ _id: new ObjectId(templateId) });

            if (template) {
                return {
                    success: true,
                    template: {
                        template_id: template._id,
                        name: template.name,
                        subjects: template.subjects,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Template not found'
                };
            }
        } catch (error) {
            console.error('Error fetching template by ID:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update a template
     * @param {string} templateId - Template ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Update result
     */
    async updateTemplate(templateId, updateData) {
        try {
            if (!ObjectId.isValid(templateId)) {
                throw new Error('Invalid template ID');
            }

            const { name, subjects } = updateData;
            const updateFields = { updatedAt: new Date() };

            if (name) updateFields.name = name.trim();
            if (Array.isArray(subjects)) updateFields.subjects = subjects;

            const collection = this.getCollection();
            const result = await collection.updateOne(
                { _id: new ObjectId(templateId) },
                { $set: updateFields }
            );

            if (result.matchedCount > 0) {
                return {
                    success: true,
                    message: 'Template updated successfully',
                    modifiedCount: result.modifiedCount
                };
            } else {
                return {
                    success: false,
                    error: 'Template not found'
                };
            }
        } catch (error) {
            console.error('Error updating template:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a template
     * @param {string} templateId - Template ID
     * @returns {Promise<Object>} Delete result
     */
    async deleteTemplate(templateId) {
        try {
            if (!ObjectId.isValid(templateId)) {
                throw new Error('Invalid template ID');
            }

            const collection = this.getCollection();
            const result = await collection.deleteOne({ _id: new ObjectId(templateId) });

            if (result.deletedCount > 0) {
                return {
                    success: true,
                    message: 'Template deleted successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'Template not found'
                };
            }
        } catch (error) {
            console.error('Error deleting template:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search templates by name
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching templates
     */
    async searchTemplates(searchTerm) {
        try {
            const collection = this.getCollection();
            const templates = await collection.find({
                name: { $regex: searchTerm, $options: 'i' }
            }).toArray();

            return {
                success: true,
                templates: templates.map(template => ({
                    template_id: template._id,
                    name: template.name,
                    subjects: template.subjects,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }))
            };
        } catch (error) {
            console.error('Error searching templates:', error.message);
            return {
                success: false,
                error: error.message,
                templates: []
            };
        }
    }

    /**
     * Check if template name already exists
     * @param {string} name - Template name
     * @param {string} excludeId - ID to exclude from check (for updates)
     * @returns {Promise<boolean>} True if name exists
     */
    async templateNameExists(name, excludeId = null) {
        try {
            const collection = this.getCollection();
            const query = { name: name.trim() };

            if (excludeId && ObjectId.isValid(excludeId)) {
                query._id = { $ne: new ObjectId(excludeId) };
            }

            const existingTemplate = await collection.findOne(query);
            return !!existingTemplate;
        } catch (error) {
            console.error('Error checking template name:', error.message);
            return false;
        }
    }
}

module.exports = SubjectTemplateModel;