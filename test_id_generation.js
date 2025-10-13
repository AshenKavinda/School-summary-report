// Test script to verify ID generation format
function generateId() {
    return 'SUM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

console.log('Testing new ID generation format:');
for (let i = 0; i < 5; i++) {
    const id = generateId();
    console.log(`${i + 1}. ${id}`);
    
    // Verify format
    if (id.startsWith('SUM_') && id.length > 15) {
        console.log('   ✅ Format is correct (starts with SUM_ and has proper length)');
    } else {
        console.log('   ❌ Format is incorrect');
    }
}

console.log('\nThis format should now match the summaries collection format and fix the ID mismatch issue.');