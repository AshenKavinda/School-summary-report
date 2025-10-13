const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkData() {
    const client = new MongoClient(process.env.MONGODB_URL);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('school_summary_db');
        
        // Check summaries collection
        console.log('\n=== SUMMARIES COLLECTION ===');
        const summaries = await db.collection('summaries').find({}).toArray();
        console.log(`Found ${summaries.length} summaries:`);
        summaries.forEach((summary, index) => {
            console.log(`${index + 1}. ID: ${summary.id}, Name: ${summary.name}, Year: ${summary.year}`);
        });
        
        // Check marks collection
        console.log('\n=== MARKS COLLECTION ===');
        const marks = await db.collection('marks').find({}).toArray();
        console.log(`Found ${marks.length} marks records:`);
        marks.forEach((mark, index) => {
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

checkData();