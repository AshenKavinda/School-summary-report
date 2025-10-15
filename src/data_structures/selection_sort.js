/**
 * Selection Sort Algorithm Implementation
 * 
 * Selection sort works by finding the minimum element from the unsorted portion
 * and placing it at the beginning. It maintains two subarrays:
 * 1. The sorted subarray (initially empty)
 * 2. The unsorted subarray (initially the entire array)
 * 
 * Time Complexity: O(n²) in all cases
 * Space Complexity: O(1) - in-place sorting
 */

// Log when script is loaded
console.log('Selection Sort algorithm loaded successfully');

class SelectionSort {
    /**
     * Sort an array of student data by marks in ascending order
     * @param {Array} students - Array of student objects with marks
     * @param {string} sortBy - Property to sort by (default: 'mark')
     * @param {boolean} ascending - Sort order (default: true for ascending)
     * @returns {Array} - Sorted array of students
     */
    static sortStudentsByMarks(students, sortBy = 'mark', ascending = true) {
        // Create a copy to avoid mutating the original array
        const sortedStudents = [...students];
        
        if (sortedStudents.length <= 1) {
            return sortedStudents;
        }
        
        // Selection sort implementation
        for (let i = 0; i < sortedStudents.length - 1; i++) {
            let extremeIndex = i; // Index of minimum (ascending) or maximum (descending)
            
            // Find the extreme element in the remaining unsorted array
            for (let j = i + 1; j < sortedStudents.length; j++) {
                const currentValue = this.getValue(sortedStudents[j], sortBy);
                const extremeValue = this.getValue(sortedStudents[extremeIndex], sortBy);
                
                if (ascending) {
                    // Find minimum for ascending order
                    if (currentValue < extremeValue) {
                        extremeIndex = j;
                    }
                } else {
                    // Find maximum for descending order
                    if (currentValue > extremeValue) {
                        extremeIndex = j;
                    }
                }
            }
            
            // Swap the found extreme element with the first element
            if (extremeIndex !== i) {
                this.swap(sortedStudents, i, extremeIndex);
            }
        }
        
        return sortedStudents;
    }
    
    /**
     * Sort table data with support for different data types
     * @param {Array} data - Array of objects to sort
     * @param {string} sortBy - Property to sort by
     * @param {boolean} ascending - Sort order
     * @returns {Array} - Sorted array
     */
    static sortTableData(data, sortBy, ascending = true) {
        const sortedData = [...data];
        
        if (sortedData.length <= 1) {
            return sortedData;
        }
        
        for (let i = 0; i < sortedData.length - 1; i++) {
            let extremeIndex = i;
            
            for (let j = i + 1; j < sortedData.length; j++) {
                const currentValue = this.getValue(sortedData[j], sortBy);
                const extremeValue = this.getValue(sortedData[extremeIndex], sortBy);
                
                const comparison = this.compare(currentValue, extremeValue);
                
                if (ascending ? comparison < 0 : comparison > 0) {
                    extremeIndex = j;
                }
            }
            
            if (extremeIndex !== i) {
                this.swap(sortedData, i, extremeIndex);
            }
        }
        
        return sortedData;
    }
    
    /**
     * Sort numeric array using selection sort
     * @param {Array} arr - Array of numbers
     * @param {boolean} ascending - Sort order
     * @returns {Array} - Sorted array
     */
    static sortNumericArray(arr, ascending = true) {
        const sortedArray = [...arr];
        
        if (sortedArray.length <= 1) {
            return sortedArray;
        }
        
        for (let i = 0; i < sortedArray.length - 1; i++) {
            let extremeIndex = i;
            
            for (let j = i + 1; j < sortedArray.length; j++) {
                if (ascending) {
                    if (sortedArray[j] < sortedArray[extremeIndex]) {
                        extremeIndex = j;
                    }
                } else {
                    if (sortedArray[j] > sortedArray[extremeIndex]) {
                        extremeIndex = j;
                    }
                }
            }
            
            if (extremeIndex !== i) {
                this.swap(sortedArray, i, extremeIndex);
            }
        }
        
        return sortedArray;
    }
    
    /**
     * Get value from object property with nested property support
     * @param {Object} obj - Object to get value from
     * @param {string} property - Property path (e.g., 'mark' or 'student.name')
     * @returns {*} - Property value
     */
    static getValue(obj, property) {
        if (!obj || !property) return null;
        
        // Handle nested properties
        const properties = property.split('.');
        let value = obj;
        
        for (const prop of properties) {
            if (value === null || value === undefined) return null;
            value = value[prop];
        }
        
        return value;
    }
    
    /**
     * Compare two values handling different data types
     * @param {*} a - First value
     * @param {*} b - Second value
     * @returns {number} - Comparison result (-1, 0, 1)
     */
    static compare(a, b) {
        // Handle null/undefined values
        if (a === null || a === undefined) {
            return (b === null || b === undefined) ? 0 : 1;
        }
        if (b === null || b === undefined) {
            return -1;
        }
        
        // Handle numeric values
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        
        // Handle string values
        if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b, undefined, { numeric: true });
        }
        
        // Convert to string for comparison
        const aStr = String(a);
        const bStr = String(b);
        return aStr.localeCompare(bStr, undefined, { numeric: true });
    }
    
    /**
     * Swap two elements in an array
     * @param {Array} arr - Array to perform swap on
     * @param {number} i - First index
     * @param {number} j - Second index
     */
    static swap(arr, i, j) {
        if (i !== j && i >= 0 && j >= 0 && i < arr.length && j < arr.length) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    /**
     * Sort students with grade calculation and maintain original indexes
     * @param {Array} students - Array of student objects
     * @param {boolean} ascending - Sort order
     * @returns {Array} - Sorted students with calculated grades
     */
    static sortStudentsWithGrades(students, ascending = true) {
        // Add grade calculation to each student
        const studentsWithGrades = students.map(student => {
            const mark = student.mark || 0;
            const grade = this.calculateGrade(mark);
            
            return {
                ...student,
                grade: grade,
                originalIndex: student.index || student.originalIndex
            };
        });
        
        // Sort by marks
        return this.sortStudentsByMarks(studentsWithGrades, 'mark', ascending);
    }
    
    /**
     * Calculate grade based on mark
     * @param {number} mark - Student's mark
     * @returns {string} - Grade letter
     */
    static calculateGrade(mark) {
        if (mark >= 90) return 'A+';
        if (mark >= 85) return 'A';
        if (mark >= 80) return 'A-';
        if (mark >= 75) return 'B+';
        if (mark >= 70) return 'B';
        if (mark >= 65) return 'B-';
        if (mark >= 60) return 'C+';
        if (mark >= 55) return 'C';
        if (mark >= 50) return 'C-';
        return 'F';
    }
    
    /**
     * Get detailed sorting statistics
     * @param {Array} originalArray - Original unsorted array
     * @param {Array} sortedArray - Sorted array
     * @returns {Object} - Sorting statistics
     */
    static getSortingStats(originalArray, sortedArray) {
        const n = originalArray.length;
        const comparisons = Math.floor((n * (n - 1)) / 2); // Selection sort always makes n(n-1)/2 comparisons
        const swaps = this.countSwaps(originalArray, sortedArray);
        
        return {
            arraySize: n,
            comparisons: comparisons,
            swaps: swaps,
            timeComplexity: `O(n²) where n = ${n}`,
            spaceComplexity: 'O(1)',
            algorithm: 'Selection Sort'
        };
    }
    
    /**
     * Count the number of swaps needed to transform original to sorted array
     * @param {Array} original - Original array
     * @param {Array} sorted - Sorted array
     * @returns {number} - Number of swaps
     */
    static countSwaps(original, sorted) {
        // This is an approximation since we don't track actual swaps during sorting
        let swaps = 0;
        const temp = [...original];
        
        for (let i = 0; i < temp.length - 1; i++) {
            if (temp[i] !== sorted[i]) {
                // Find the correct element and count as one swap
                const correctIndex = temp.findIndex((val, idx) => idx > i && val === sorted[i]);
                if (correctIndex !== -1) {
                    swaps++;
                    // Simulate the swap
                    [temp[i], temp[correctIndex]] = [temp[correctIndex], temp[i]];
                }
            }
        }
        
        return swaps;
    }
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionSort;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.SelectionSort = SelectionSort;
} else if (typeof global !== 'undefined') {
    global.SelectionSort = SelectionSort;
}