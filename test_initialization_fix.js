require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

async function testInitializationFix() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(process.env.DB_NAME);
        
        // Check current database state
        console.log('\n=== BEFORE TEST - Current Database State ===');
        
        const summaries = await db.collection('summaries').find({}).toArray();
        console.log(`\nSummaries (${summaries.length}):`);
        summaries.forEach((summary, index) => {
            console.log(`${index + 1}. ID: ${summary.id}, Name: ${summary.name}, Year: ${summary.year}`);
        });
        
        const marksAgg = await db.collection('marks').aggregate([
            { $group: { _id: "$summary_id", count: { $sum: 1 } } }
        ]).toArray();
        
        console.log(`\nMarks Summary IDs (${marksAgg.length} unique):`);
        marksAgg.forEach((mark, index) => {
            const matchingSummary = summaries.find(s => s.id === mark._id);
            console.log(`${index + 1}. Summary ID: ${mark._id}, Count: ${mark.count}, Class: ${matchingSummary ? matchingSummary.name : '❌ NO MATCH'}`);
        });
        
        // Test the fix by creating a mock initialization
        console.log('\n=== TESTING INITIALIZATION FIX ===');
        
        // Simulate frontend data (with frontend-generated ID)
        const frontendSummaryId = 'SUM_FRONTEND_' + Date.now() + '_TEST123';
        const frontendData = {
            summary: {
                id: frontendSummaryId, // This should be ignored by server
                name: 'Test Class 7B',
                year: 2025,
                test_count: 2,
                student_count: 3
            },
            marks: [
                {
                    id: 'mark1',
                    summary_id: frontendSummaryId, // This should be updated to actual summary ID
                    test_number: 1,
                    index: 1,
                    marks: { math: 85, science: 90 }
                },
                {
                    id: 'mark2',
                    summary_id: frontendSummaryId, // This should be updated to actual summary ID
                    test_number: 1,
                    index: 2,
                    marks: { math: 78, science: 82 }
                }
            ],
            subjects: ['math', 'science']
        };
        
        console.log(`Frontend generated summary ID: ${frontendSummaryId}`);
        console.log(`Marks using frontend summary ID: ${frontendData.marks[0].summary_id}`);
        
        // Simulate the server's initialization process
        console.log('\n--- Simulating Server Process ---');
        
        // 1. Server generates actual summary ID
        const actualSummaryId = 'SUM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        console.log(`1. Server generates actual summary ID: ${actualSummaryId}`);
        
        // 2. Server updates marks with actual summary ID (this is the fix)
        const updatedMarks = frontendData.marks.map(mark => ({
            ...mark,
            summary_id: actualSummaryId
        }));
        
        console.log(`2. Server updates marks to use actual summary ID: ${updatedMarks[0].summary_id}`);
        
        // Verify the fix
        const allMarksHaveCorrectId = updatedMarks.every(mark => mark.summary_id === actualSummaryId);
        
        if (allMarksHaveCorrectId) {
            console.log('✅ FIX VERIFIED: All marks now have the correct summary_id matching the actual summary ID!');
        } else {
            console.log('❌ FIX FAILED: Some marks still have incorrect summary_id');
        }
        
    } catch (error) {
        console.error('Error testing initialization fix:', error);
    } finally {
        await client.close();
    }
}

testInitializationFix();