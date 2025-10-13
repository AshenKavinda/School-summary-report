const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixData() {
    const client = new MongoClient(process.env.MONGODB_URL);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('school_summary_db');
        
        // Get the current summary ID
        const summaries = await db.collection('summaries').find({}).toArray();
        if (summaries.length === 0) {
            console.log('No summaries found');
            return;
        }
        
        const currentSummaryId = summaries[0].id;
        console.log('Current summary ID:', currentSummaryId);
        
        // Update all marks records to use the current summary ID
        const result = await db.collection('marks').updateMany(
            {},
            { $set: { summary_id: currentSummaryId } }
        );
        
        console.log(`Updated ${result.modifiedCount} marks records`);
        
        // Verify the update
        const updatedMarks = await db.collection('marks').find({}).limit(2).toArray();
        console.log('Sample updated marks:');
        updatedMarks.forEach((mark, index) => {
            console.log(`${index + 1}. Summary ID: ${mark.summary_id}, Test: ${mark.test_number}`);
            if (mark.marks) {
                console.log(`   Subjects: ${Object.keys(mark.marks).join(', ')}`);
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

fixData();