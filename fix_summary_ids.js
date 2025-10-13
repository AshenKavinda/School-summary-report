require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

async function fixSummaryIds() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(process.env.DB_NAME);
        
        // Get all summaries
        const summaries = await db.collection('summaries').find({}).toArray();
        console.log('\n=== Current Summaries ===');
        summaries.forEach((summary, index) => {
            console.log(`${index + 1}. ID: ${summary.id}, Name: ${summary.name}, Year: ${summary.year}`);
        });
        
        // Get all unique summary IDs from marks
        const marksAgg = await db.collection('marks').aggregate([
            { $group: { _id: "$summary_id", count: { $sum: 1 } } }
        ]).toArray();
        
        console.log('\n=== Current Marks Summary IDs ===');
        marksAgg.forEach((mark, index) => {
            console.log(`${index + 1}. Summary ID: ${mark._id}, Count: ${mark.count}`);
        });
        
        // Let's map the marks to the correct summaries
        // Based on the data, it looks like:
        // - sum_1760373604234_w135d0b6y should map to SUM_1760373608719_T1MKSQMGT (1A class - maths, sinhala subjects)
        // - sum_1760373644434_dmnuz4uhi should map to SUM_1760373647684_A8S5JGZMC (6A class - op1, op2 subjects)
        
        console.log('\n=== Fixing Summary IDs ===');
        
        // Update marks for 1A class (maths, sinhala)
        const result1 = await db.collection('marks').updateMany(
            { summary_id: "sum_1760373604234_w135d0b6y" },
            { $set: { summary_id: "SUM_1760373608719_T1MKSQMGT" } }
        );
        console.log(`Updated ${result1.modifiedCount} marks records for 1A class`);
        
        // Update marks for 6A class (op1, op2)
        const result2 = await db.collection('marks').updateMany(
            { summary_id: "sum_1760373644434_dmnuz4uhi" },
            { $set: { summary_id: "SUM_1760373647684_A8S5JGZMC" } }
        );
        console.log(`Updated ${result2.modifiedCount} marks records for 6A class`);
        
        // Verify the fix
        console.log('\n=== Verification ===');
        const updatedMarksAgg = await db.collection('marks').aggregate([
            { $group: { _id: "$summary_id", count: { $sum: 1 } } }
        ]).toArray();
        
        updatedMarksAgg.forEach((mark, index) => {
            const matchingSummary = summaries.find(s => s.id === mark._id);
            console.log(`${index + 1}. Summary ID: ${mark._id}, Count: ${mark.count}, Class: ${matchingSummary ? matchingSummary.name : 'NOT FOUND'}`);
        });
        
        console.log('\n✅ Database fix completed!');
        
    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        await client.close();
    }
}

fixSummaryIds();