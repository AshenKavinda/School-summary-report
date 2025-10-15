# Selection Sort Implementation for Student Marks

## Overview
This project implements the **Selection Sort algorithm** to sort student marks in tables throughout the School Summary Report application.

## Features

### 1. Selection Sort Algorithm (`src/data_structures/selection_sort.js`)
- **Time Complexity**: O(n²) for all cases (best, average, worst)
- **Space Complexity**: O(1) - in-place sorting
- **Stability**: Not stable (relative order of equal elements may change)

### 2. Sort Controls in Export View (`src/view/export.html`)
- **Subject Selection Dropdown**: Choose which subject to sort by
- **Sort Ascending Button**: Sort marks from low to high
- **Sort Descending Button**: Sort marks from high to low  
- **Reset Button**: Restore original table order
- **Header Click Sorting**: Click on any subject header to sort by that subject

### 3. Sort Controls in Marks Manager (`src/view/marks_manager.html`)
- **Sort Buttons**: Dedicated Low to High and High to Low buttons
- **Header Click**: Click on "Mark" column header to toggle sort direction
- **Reset Button**: Restore original LinkedList order

## How It Works

### Selection Sort Algorithm
```javascript
class SelectionSort {
    static sortStudentsByMarks(students, sortBy = 'mark', ascending = true) {
        // 1. Find the minimum/maximum element in the unsorted portion
        // 2. Swap it with the first element of the unsorted portion
        // 3. Repeat for the remaining unsorted elements
    }
}
```

### Sort Process
1. **Data Preparation**: Student marks are extracted and prepared for sorting
2. **Null Handling**: Missing marks are placed at the end regardless of sort direction
3. **Algorithm Execution**: Selection sort is applied to the data
4. **Statistics Collection**: Comparisons and swaps are tracked
5. **UI Update**: Table is refreshed with sorted data and visual indicators

### Visual Indicators
- **Sort Arrows**: ↑ (ascending), ↓ (descending), ⇅ (unsorted)
- **Column Highlighting**: Sorted column is highlighted with blue background
- **Statistics Display**: Shows number of comparisons and swaps performed

## Usage Examples

### Export View
1. Navigate to any test export page
2. Select a subject from the dropdown
3. Click "Sort ↑" for ascending or "Sort ↓" for descending
4. Click "Reset" to restore original order
5. Or click directly on subject headers to sort

### Marks Manager
1. Enter some student marks using the LinkedList interface
2. Click "Low to High" or "High to Low" buttons
3. Click on "Mark" header to toggle between sort directions
4. Click "Reset" to restore original order

## Technical Details

### Data Handling
- **Valid Marks**: Numeric values between 0-100
- **Invalid/Missing Marks**: Displayed as "-" and sorted to the end
- **Grade Calculation**: Automatic grade assignment (A+, A, B+, etc.)

### Performance
- **Small datasets (< 50 students)**: Instant sorting
- **Larger datasets**: Visible feedback with progress indicators
- **Statistics**: Real-time display of algorithm performance metrics

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript**: ES6+ features used
- **Responsive Design**: Works on desktop and mobile devices

## Files Modified
- `src/data_structures/selection_sort.js` - Core algorithm implementation
- `src/view/export.html` - Export page with sorting controls
- `src/view/marks_manager.html` - Marks manager with LinkedList sorting
- `test_selection_sort.js` - Algorithm testing script
- `test_sort.html` - Interactive sorting demonstration

## Testing
Run the test script to verify algorithm functionality:
```bash
node test_selection_sort.js
```

Or open `test_sort.html` in a browser for interactive testing.

## Algorithm Visualization
The Selection Sort algorithm works by:
1. Finding the smallest (or largest) element in the unsorted portion
2. Swapping it with the first element of the unsorted portion
3. Moving the boundary of the sorted portion one position right
4. Repeating until the entire array is sorted

This implementation provides educational value by showing:
- Number of comparisons made
- Number of swaps performed
- Visual progress through sorting steps
- Real-time performance statistics