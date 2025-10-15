/**
 * Test file for Selection Sort Algorithm
 * Demonstrates the functionality of the SelectionSort class
 */

// Import the SelectionSort class (assuming Node.js environment)
const SelectionSort = require('./src/data_structures/selection_sort.js');

console.log('='.repeat(60));
console.log('SELECTION SORT ALGORITHM TESTING');
console.log('='.repeat(60));

// Test 1: Basic numeric array sorting
console.log('\n1. TESTING BASIC NUMERIC ARRAY SORTING');
console.log('-'.repeat(40));

const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', numbers);

const sortedAsc = SelectionSort.sortNumericArray(numbers, true);
console.log('Sorted ascending:', sortedAsc);

const sortedDesc = SelectionSort.sortNumericArray(numbers, false);
console.log('Sorted descending:', sortedDesc);

// Test 2: Student marks sorting
console.log('\n2. TESTING STUDENT MARKS SORTING');
console.log('-'.repeat(40));

const students = [
    { index: 1, mark: 85, name: 'Alice' },
    { index: 2, mark: 92, name: 'Bob' },
    { index: 3, mark: 78, name: 'Charlie' },
    { index: 4, mark: 95, name: 'Diana' },
    { index: 5, mark: 67, name: 'Eve' },
    { index: 6, mark: 88, name: 'Frank' }
];

console.log('Original students:');
students.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark}`)
);

const sortedStudentsAsc = SelectionSort.sortStudentsByMarks(students, 'mark', true);
console.log('\nSorted by marks (ascending):');
sortedStudentsAsc.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark}`)
);

const sortedStudentsDesc = SelectionSort.sortStudentsByMarks(students, 'mark', false);
console.log('\nSorted by marks (descending):');
sortedStudentsDesc.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark}`)
);

// Test 3: Students with grades
console.log('\n3. TESTING STUDENTS WITH GRADE CALCULATION');
console.log('-'.repeat(40));

const studentsWithGrades = SelectionSort.sortStudentsWithGrades(students, false);
console.log('Students sorted by marks (descending) with grades:');
studentsWithGrades.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark} (Grade: ${student.grade})`)
);

// Test 4: Handling null/undefined marks
console.log('\n4. TESTING WITH NULL/UNDEFINED MARKS');
console.log('-'.repeat(40));

const studentsWithMissingMarks = [
    { index: 1, mark: 85, name: 'Alice' },
    { index: 2, mark: null, name: 'Bob' },
    { index: 3, mark: 78, name: 'Charlie' },
    { index: 4, mark: undefined, name: 'Diana' },
    { index: 5, mark: 67, name: 'Eve' }
];

console.log('Students with missing marks:');
studentsWithMissingMarks.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark || 'N/A'}`)
);

const sortedWithMissing = SelectionSort.sortStudentsByMarks(studentsWithMissingMarks, 'mark', true);
console.log('\nSorted (missing marks handled):');
sortedWithMissing.forEach(student => 
    console.log(`  ${student.index}. ${student.name}: ${student.mark || 'N/A'}`)
);

// Test 5: Performance statistics
console.log('\n5. ALGORITHM PERFORMANCE STATISTICS');
console.log('-'.repeat(40));

const largeArray = Array.from({length: 20}, (_, i) => Math.floor(Math.random() * 100));
console.log(`Testing with array of ${largeArray.length} elements:`);
console.log('Original:', largeArray);

const sortedLarge = SelectionSort.sortNumericArray(largeArray, true);
console.log('Sorted:', sortedLarge);

const stats = SelectionSort.getSortingStats(largeArray, sortedLarge);
console.log('\nPerformance Statistics:');
console.log(`  Array Size: ${stats.arraySize}`);
console.log(`  Comparisons: ${stats.comparisons}`);
console.log(`  Estimated Swaps: ${stats.swaps}`);
console.log(`  Time Complexity: ${stats.timeComplexity}`);
console.log(`  Space Complexity: ${stats.spaceComplexity}`);
console.log(`  Algorithm: ${stats.algorithm}`);

// Test 6: Table data sorting
console.log('\n6. TESTING TABLE DATA SORTING');
console.log('-'.repeat(40));

const tableData = [
    { student: 'Alice', math: 85, science: 90, english: 78 },
    { student: 'Bob', math: 92, science: 88, english: 85 },
    { student: 'Charlie', math: 78, science: 82, english: 90 },
    { student: 'Diana', math: 95, science: 93, english: 87 }
];

console.log('Original table data:');
tableData.forEach(row => 
    console.log(`  ${row.student}: Math=${row.math}, Science=${row.science}, English=${row.english}`)
);

const sortedByMath = SelectionSort.sortTableData(tableData, 'math', false);
console.log('\nSorted by Math (descending):');
sortedByMath.forEach(row => 
    console.log(`  ${row.student}: Math=${row.math}, Science=${row.science}, English=${row.english}`)
);

console.log('\n' + '='.repeat(60));
console.log('SELECTION SORT TESTING COMPLETED');
console.log('='.repeat(60));