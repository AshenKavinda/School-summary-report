// Example usage of the database connection
require('dotenv').config();
const { dbConnection } = require('./db.js');

// Example function showing how to use the database connection
async function exampleDatabaseOperations() {
    try {
        // Connect to database
        await dbConnection.connect();
        
        // Get a collection
        const studentsCollection = dbConnection.getCollection('students');
        const schoolsCollection = dbConnection.getCollection('schools');
        
        // Example: Insert a student record
        const studentData = {
            name: 'John Doe',
            grade: 10,
            school_id: 'school_001',
            subjects: ['Math', 'Science', 'English'],
            created_at: new Date()
        };
        
        const insertResult = await studentsCollection.insertOne(studentData);
        console.log('Student inserted:', insertResult.insertedId);
        
        // Example: Find students
        const students = await studentsCollection.find({ grade: 10 }).toArray();
        console.log('Grade 10 students:', students.length);
        
        // Example: Update a record
        await studentsCollection.updateOne(
            { _id: insertResult.insertedId },
            { $set: { last_updated: new Date() } }
        );
        
        // Example: Aggregate data for school summary
        const schoolSummary = await studentsCollection.aggregate([
            {
                $group: {
                    _id: '$school_id',
                    total_students: { $sum: 1 },
                    average_grade: { $avg: '$grade' }
                }
            }
        ]).toArray();
        
        console.log('School summary:', schoolSummary);
        
        // Check connection status
        console.log('Database status:', dbConnection.getStatus());
        
    } catch (error) {
        console.error('Database operation error:', error.message);
    }
}

// Example of how to use in other modules
module.exports = {
    exampleDatabaseOperations,
    
    // Example helper functions that other modules can use
    async getStudentsByGrade(grade) {
        const collection = dbConnection.getCollection('students');
        return await collection.find({ grade }).toArray();
    },
    
    async getSchoolSummary(schoolId) {
        const collection = dbConnection.getCollection('students');
        return await collection.aggregate([
            { $match: { school_id: schoolId } },
            {
                $group: {
                    _id: '$school_id',
                    total_students: { $sum: 1 },
                    subjects: { $addToSet: '$subjects' },
                    grade_distribution: {
                        $push: '$grade'
                    }
                }
            }
        ]).toArray();
    }
};

// Run example if this file is executed directly
if (require.main === module) {
    exampleDatabaseOperations()
        .then(() => {
            console.log('Example completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Example failed:', error);
            process.exit(1);
        });
}